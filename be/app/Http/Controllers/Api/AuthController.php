<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            if ($validator->fails()) {
                return ApiResponse::validationError($validator);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('MyApp')->plainTextToken;

            $user->remember_token = $token;
            $user->save();

            return ApiResponse::success([
                'user' => array_merge($user->toArray(), ['token' => $token]),
            ], 'User created successfully');
        } catch (\Throwable $th) {
            return ApiResponse::error('An error occurred: ' . $th->getMessage());
        }
    }

    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:8',
            ]);

            if ($validator->fails()) {
                return ApiResponse::validationError($validator);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $token = $user->createToken('MyApp')->plainTextToken;

            return ApiResponse::success([
                'user' => array_merge($user->toArray(), ['token' => $token]),
            ], 'User Login successful');
        } catch (ValidationException $e) {
            return ApiResponse::validationError($e->validator);
        } catch (\Exception $e) {
            return ApiResponse::error('An error occurred while logging in: ' . $e->getMessage());
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ApiResponse::success(null, 'Logged out successfully');
    }

    /**
     * Redirect to provider (Google/Facebook)
     */
    public function redirectToProvider($provider)
    {
        $validProviders = ['google', 'facebook'];

        if (!in_array($provider, $validProviders)) {
            return ApiResponse::error('Unsupported provider', 400);
        }

        try {
            $redirectUrl = Socialite::driver($provider)
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return ApiResponse::success(['redirect_url' => $redirectUrl], 'Redirecting to ' . ucfirst($provider));
        } catch (\Exception $e) {
            return ApiResponse::error('Failed to redirect: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle callback from provider
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        $validProviders = ['google', 'facebook'];

        if (!in_array($provider, $validProviders)) {
            return ApiResponse::error('Unsupported provider', 400);
        }

        try {
            // Lấy access_token từ frontend (Expo gửi qua POST)
            $accessToken = $request->input('access_token');

            if (!$accessToken) {
                return ApiResponse::error('Access token is required', 400);
            }

            // Dùng access_token để lấy thông tin user từ provider
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($accessToken);

            // Tìm user theo provider_id hoặc email
            $user = User::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();

            if (!$user) {
                // Kiểm tra email đã tồn tại chưa (tránh duplicate)
                $existingUser = User::where('email', $socialUser->getEmail())->first();

                if ($existingUser) {
                    // Gộp tài khoản: cập nhật provider
                    $existingUser->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'avatar' => $socialUser->getAvatar(),
                    ]);
                    $user = $existingUser;
                } else {
                    // Tạo user mới
                    $user = User::create([
                        'name' => $socialUser->getName() ?? 'User',
                        'email' => $socialUser->getEmail(),
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'password' => Hash::make(Str::random(16)),
                        'avatar' => $socialUser->getAvatar(),
                    ]);
                }
            } else {
                // Cập nhật avatar nếu thay đổi
                if ($user->avatar !== $socialUser->getAvatar()) {
                    $user->avatar = $socialUser->getAvatar();
                    $user->save();
                }
            }

            // Tạo token
            $token = $user->createToken('MyApp')->plainTextToken;

            return ApiResponse::success([
                'user' => array_merge($user->toArray(), ['token' => $token]),
            ], 'Social login successful');
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            return ApiResponse::error('Invalid state. Please try again.', 400);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return ApiResponse::error('Invalid access token.', 401);
        } catch (\Exception $e) {
            return ApiResponse::error('Authentication failed: ' . $e->getMessage(), 500);
        }
    }
}
