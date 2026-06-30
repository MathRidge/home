MathRidge FX Asset: Blue Comic Focus Burst TRUE ALPHA

Main files:
1. fx_comic_blue_focus_burst_TRUE_ALPHA.png
   - Original generated size: 1672 x 941 px
   - True alpha PNG
   - Use as an animated overlay above story backgrounds.

2. fx_comic_blue_focus_burst_TRUE_ALPHA_1920x1080.png
   - Standard 16:9 game canvas version
   - True alpha PNG
   - Recommended for full-screen web layout.

Preview files:
- fx_comic_blue_focus_burst_preview_dark.png
- fx_comic_blue_focus_burst_preview_gradient.png

Suggested CSS use:
.fx-burst {
  position: absolute;
  inset: 0;
  background-image: url("fx_comic_blue_focus_burst_TRUE_ALPHA_1920x1080.png");
  background-size: cover;
  background-position: center;
  opacity: 0;
  pointer-events: none;
}

.fx-burst.play {
  animation: blueBurstImpact 900ms ease-out forwards;
}
