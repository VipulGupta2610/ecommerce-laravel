<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'image',
    ];

    protected $appends = ['image_url', 'large_image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('uploads/products/small/' . $this->image);
        }
        return null;
    }

    public function getLargeImageUrlAttribute()
    {
        if ($this->image) {
            return asset('uploads/products/large/' . $this->image);
        }
        return null;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
