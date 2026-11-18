# Keys whose slug breaks the pattern or the length

A key over the limit fails: `brand:abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklm`.

A slug with an uppercase letter fails: `campaign:Holiday-brief`.

A slug with an underscore fails: `program:{slug}_terms`.

A slug with a dot fails: `theme:brand.v2`.

A key built from a slug that cannot fit fails: `campaign:{slug}-decision-defaults-and-more`.
