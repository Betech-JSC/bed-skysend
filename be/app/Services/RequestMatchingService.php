<?php

namespace App\Services;

use App\Models\Request;
use App\Models\Flight;
use App\Models\RequestMatch;
use App\Models\User;
use App\Services\ExpoPushService;
use App\Services\FirebaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RequestMatchingService
{
    public function __construct(
        private FirebaseService $firebaseService
    ) {}

    /**
     * Match một request với tất cả flights phù hợp
     */
    public function matchRequest(Request $request): array
    {
        if ($request->flight_id !== null) {
            // Request đã có flight, không cần match
            return [];
        }

        if (!$request->from_airport || !$request->to_airport || !$request->desired_date) {
            // Request chưa đủ thông tin để match
            return [];
        }

        // Tìm flights phù hợp
        $flights = Flight::where('from_airport', $request->from_airport)
            ->where('to_airport', $request->to_airport)
            ->whereDate('flight_date', $request->desired_date)
            ->where('verified', true)
            ->where('customer_id', '!=', $request->sender_id) // Không match với chính sender
            ->whereRaw('max_weight - booked_weight >= ?', [$request->desired_weight ?? 0.5])
            ->with('customer')
            ->get();

        $matches = [];
        $newMatchesCount = 0;

        foreach ($flights as $flight) {
            $matchScore = $this->calculateMatchScore($request, $flight);

            if ($matchScore >= 50) { // Chỉ match nếu score >= 50
                [$match, $isNew] = $this->createMatch($request, $flight, $matchScore);
                if ($match) {
                    $matches[] = $match;
                    // Chỉ đếm matches mới
                    if ($isNew) {
                        $newMatchesCount++;
                    }
                }
            }
        }

        // Chỉ gửi notification nếu có matches mới
        if ($newMatchesCount > 0) {
            $this->sendMatchNotifications($request, $newMatchesCount);
        }

        return $matches;
    }

    /**
     * Match một flight với tất cả requests phù hợp
     */
    public function matchFlight(Flight $flight): array
    {
        if (!$flight->verified) {
            return [];
        }

        // Tìm requests đang chờ match
        $requests = Request::waitingForMatch()
            ->where('from_airport', $flight->from_airport)
            ->where('to_airport', $flight->to_airport)
            ->whereDate('desired_date', $flight->flight_date)
            ->where('sender_id', '!=', $flight->customer_id) // Không match với chính customer
            ->where(function ($query) use ($flight) {
                $query->whereNull('desired_weight')
                    ->orWhereRaw('? >= desired_weight', [$flight->available_weight]);
            })
            ->get();

        $matches = [];
        foreach ($requests as $request) {
            $matchScore = $this->calculateMatchScore($request, $flight);

            if ($matchScore >= 50) {
                [$match, $isNew] = $this->createMatch($request, $flight, $matchScore);
                if ($match) {
                    $matches[] = $match;
                    // Chỉ gửi notification nếu match mới
                    if ($isNew) {
                        $this->sendMatchNotifications($request, 1);
                    }
                }
            }
        }

        return $matches;
    }

    /**
     * Tính điểm match giữa request và flight
     */
    public function calculateMatchScore(Request $request, Flight $flight): float
    {
        $score = 0;
        $maxScore = 100;

        // 1. Airport match (30 điểm)
        if (
            $request->from_airport === $flight->from_airport &&
            $request->to_airport === $flight->to_airport
        ) {
            $score += 30;
        }

        // 2. Date match (30 điểm)
        if ($request->desired_date && $flight->flight_date) {
            $dateDiff = abs($request->desired_date->diffInDays($flight->flight_date));
            if ($dateDiff === 0) {
                $score += 30;
            } elseif ($dateDiff === 1) {
                $score += 20; // Gần ngày
            } elseif ($dateDiff === 2) {
                $score += 10; // Khá gần
            }
        }

        // 3. Time slot match (20 điểm)
        if ($request->desired_time_slot && $request->desired_time_slot !== 'any') {
            // Có thể cải thiện logic này dựa trên thời gian bay thực tế
            // Tạm thời: nếu time_slot match thì +20
            $score += 20;
        } elseif ($request->desired_time_slot === 'any' || !$request->desired_time_slot) {
            $score += 15; // Any time slot
        }

        // 4. Weight capacity (10 điểm)
        if ($request->desired_weight && $flight->available_weight >= $request->desired_weight) {
            $score += 10;
        } elseif (!$request->desired_weight) {
            $score += 5; // Không yêu cầu weight cụ thể
        }

        // 5. Reward amount (10 điểm) - reward cao hơn = ưu tiên hơn
        if ($request->reward) {
            if ($request->reward >= 500000) {
                $score += 10;
            } elseif ($request->reward >= 300000) {
                $score += 7;
            } elseif ($request->reward >= 100000) {
                $score += 5;
            }
        }

        return min($score, $maxScore);
    }

    /**
     * Tạo RequestMatch record
     * @return array{0: RequestMatch|null, 1: bool} [match, is_new]
     */
    private function createMatch(Request $request, Flight $flight, float $matchScore): array
    {
        // Kiểm tra xem match đã tồn tại chưa
        $existingMatch = RequestMatch::where('request_id', $request->id)
            ->where('flight_id', $flight->id)
            ->first();

        if ($existingMatch) {
            // Update match score nếu tốt hơn
            $wasUpdated = false;
            if ($matchScore > $existingMatch->match_score) {
                $existingMatch->match_score = $matchScore;
                $existingMatch->matched_at = now();
                $existingMatch->save();
                $wasUpdated = true;
            }
            // Match đã tồn tại - không phải mới
            return [$existingMatch, false];
        }

        try {
            $match = RequestMatch::create([
                'request_id' => $request->id,
                'flight_id' => $flight->id,
                'customer_id' => $flight->customer_id,
                'match_score' => $matchScore,
                'status' => 'pending',
                'matched_at' => now(),
            ]);

            // Match vừa được tạo - là mới
            return [$match, true];
        } catch (\Exception $e) {
            Log::error('Error creating request match', [
                'request_id' => $request->id,
                'flight_id' => $flight->id,
                'error' => $e->getMessage(),
            ]);
            return [null, false];
        }
    }

    /**
     * Gửi notification cho sender khi có matches
     */
    private function sendMatchNotifications(Request $request, int $matchCount): void
    {
        $sender = $request->sender;
        if (!$sender) {
            return;
        }

        $title = 'Có customer phù hợp';
        $body = "Có {$matchCount} customer phù hợp với request của bạn. Xem danh sách để gửi request.";

        // Push notification vào Firebase
        $this->firebaseService->pushNotification(
            $sender->id,
            $title,
            $body,
            [
                'type' => 'request_match',
                'request_id' => $request->id,
                'request_uuid' => $request->uuid,
                'match_count' => $matchCount,
            ]
        );

        // Gửi push notification qua Expo
        if ($sender->fcm_token) {
            ExpoPushService::sendNotification(
                $sender->fcm_token,
                $title,
                $body,
                [
                    'type' => 'request_match',
                    'request_id' => $request->id,
                    'request_uuid' => $request->uuid,
                    'match_count' => $matchCount,
                ]
            );
        }
    }

    /**
     * Re-match tất cả requests đang chờ
     */
    public function reMatchAllWaitingRequests(): int
    {
        $requests = Request::waitingForMatch()
            ->where('expires_at', '>', now())
            ->get();

        $totalMatches = 0;
        foreach ($requests as $request) {
            $matches = $this->matchRequest($request);
            $totalMatches += count($matches);
        }

        return $totalMatches;
    }
}
