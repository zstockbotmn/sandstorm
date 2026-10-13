# Sandstorm fix queue (for next build, after art merge)
## Zack (12:29 PM Oct 13) — must do
- [x] SCOPE is tap-to-toggle (not hold); Q toggles too. Tap again to duck back into cover.
- [x] FIRE button on the LEFT side of the screen (move other buttons accordingly).
## Tester review ss-5c55629b6d
- [x] ENEMIES counter: only count engaged enemies, keep stable; no silent adds; "WAVE CLEARED" cue.
- [x] Real walk/breather between waves (>= ~25-40 m), verify actual 3 m/s.
- [x] Sandbag wall too tall / fills screen after turning; once not drawn after scoping out. Lower or ghost while ducked.
- [x] Rapid clicks fire every other click — revisit rate cap / input queue.
- [x] Blind fire: give it suppression (slows/reduces enemy fire), some hit chance.
- [x] Enemies stand in open while radio says "Flanking" — callouts must match real movement (rule 3).
- [x] First-contact hint: drag to aim, shots go to screen center.
- [x] Wave 2 too deadly (~20 s); soften early ramp.
