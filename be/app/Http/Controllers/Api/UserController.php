<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Storage;


class UserController extends Controller
{

    public function savePushToken(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'token' => 'required|string',
        ]);

        $user = User::find($request->user_id);
        $user->fcm_token = $request->token; // hoặc expo_push_token
        $user->save();

        return response()->json(['success' => true]);
    }

    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        // Validate dữ liệu
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'sometimes|string|max:20',
            'password' => 'sometimes|string|min:6|confirmed',
            'avatar' => 'sometimes|image|max:2048', // file ảnh, max 2MB
        ]);

        // Hash password nếu có
        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        // Lưu avatar nếu có
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public'); // lưu vào storage/app/public/avatars
            $validatedData['avatar'] = $path;

            // Xóa avatar cũ nếu muốn
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
        }

        // Cập nhật user
        $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]);
    }


    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $user->password = bcrypt($request->new_password);
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công.']);
    }

    public function uploadAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar = $path;
        $user->save();

        return response()->json([
            'message' => 'Upload avatar thành công.',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }
}
