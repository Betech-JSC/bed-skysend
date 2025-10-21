<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Matched = 'matched';
    case Confirmed = 'confirmed';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
}
