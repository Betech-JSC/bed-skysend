<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Danh sách roles và permissions
     */
    public function index(): Response
    {
        // Lấy danh sách roles (nếu có)
        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name ?? 'N/A',
                'description' => $role->description ?? '',
            ];
        });

        // Lấy danh sách admins (không sử dụng roles relationship)
        $admins = Admin::all()->map(function ($admin) {
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'super_admin' => $admin->super_admin,
                'roles' => $admin->super_admin ? ['Super Admin'] : ['Admin'], // Hiển thị dựa trên super_admin
            ];
        });

        return Inertia::render('Admin/Permissions/Index', [
            'roles' => $roles,
            'admins' => $admins,
        ]);
    }

    /**
     * Cập nhật role cho admin (tạm thời chỉ cập nhật super_admin)
     */
    public function updateAdminRole($id): RedirectResponse
    {
        $admin = Admin::findOrFail($id);

        Request::validate([
            'super_admin' => 'sometimes|boolean',
        ]);

        if (Request::has('super_admin')) {
            $admin->super_admin = Request::get('super_admin');
            $admin->save();
        }

        return redirect()->back()->with('success', 'Đã cập nhật quyền cho admin thành công');
    }
}

