//Sprite index
KISSY.add(function (S, Poly, Rect, Anim, Path, Segment) {
    
    var Sprite = Poly;
    Sprite.Rect = Rect;
    Sprite.Anim = Anim;
    Sprite.Path = Path;
    Sprite.Segment = Segment;

    return Sprite;
}, {
    requires: ['./sprite', './textsprite', './animsprite', './pathsprite', './segmentsprite']
})