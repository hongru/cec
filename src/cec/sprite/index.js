//Sprite index
KISSY.add(function (S, Poly, Rect, Text, Anim, Path, Segment) {
    
    var Sprite = Poly;
    Sprite.Rect = Rect;
    Sprite.Text = Text;
    Sprite.Anim = Anim;
    Sprite.Path = Path;
    Sprite.Segment = Segment;

    return Sprite;
}, {
    requires: ['cec/sprite/sprite', 'cec/sprite/rectsprite', 'cec/sprite/textsprite', 'cec/sprite/animsprite', 'cec/sprite/pathsprite', 'cec/sprite/segmentsprite']
})