<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ]);

        $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user,
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

    public function assignRole(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $roleName = $request->role;

        $user->syncRoles([$roleName]);

        return response()->json([
            'message' => "Đã gán role $roleName cho user.",
            'roles' => $user->getRoleNames(),
        ]);
    }
}
