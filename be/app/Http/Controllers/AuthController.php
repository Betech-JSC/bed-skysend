<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Helpers\ApiResponse; // Đừng quên import ApiResponse
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validationError($validator); // Sử dụng ApiResponse để trả về lỗi validation
        }

        // Tạo người dùng mới
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Tạo token
        $token = $user->createToken('MyApp')->plainTextToken;

        // Trả về thành công
        return ApiResponse::success([
            'user' => $user,
            'token' => $token,
        ], 'User created successfully');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validationError($validator); // Sử dụng ApiResponse để trả về lỗi validation
        }

        // Kiểm tra người dùng và mật khẩu
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Tạo token
        $token = $user->createToken('MyApp')->plainTextToken;

        // Trả về thành công
        return ApiResponse::success([
            'message' => 'Login successful',
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        // Xóa tất cả các token của người dùng
        $request->user()->tokens->each(function ($token) {
            $token->delete();
        });

        // Trả về thành công
        return ApiResponse::success(null, 'Logged out successfully');
    }
}
