<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ChatMessage implements ShouldBroadcast
{
    public $from;
    public $to;
    public $text;

    public function __construct($from, $to, $text)
    {
        $this->from = $from;
        $this->to   = $to;
        $this->text = $text;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->from . '.' . $this->to);
    }

    public function broadcastAs(): string
    {
        return 'ChatMessage';
    }
}
