# Study Malatang 麻辣烫

A cute study timer: build a bowl of malatang, weigh it, and study while it cooks.
The heavier the bowl, the longer you study.

1. **Broth**: pick Classic Mala, Bone Broth, Tomato Broth or Mushroom Broth.
2. **Open shelf**: drag veggies, mushrooms, tofu, noodles, eggs, balls and seafood into your bowl with the metal tongs.
3. **Freezer**: slide a glass door open and grab pork belly, beef, lamb or chicken slices.
4. **Weigh**: the bowl goes onto the scale. Each item has a realistic weight per grab (udon 200 g, corn 60 g, tofu puff 8 g…).
   - Study time = weight ÷ pace (Chill 15 g/min, Regular 10 g/min, Exam week 6 g/min), up to 5 hours.
5. **Sauce bar 调料台**: a self-serve sauce counter with 15 sauce bins, 7 squeeze bottles, 9 oils/soys/vinegars,
   10 fresh herbs & toppings and 9 dry seasonings. Hover for the name, flavor and spice level; click to add it to your
   dipping bowl (ladle, scoop, squeeze, pour, tongs or shaker). "Try a House Blend" makes one of 3 recipes.
6. **Study**: the pot goes on the stove and the timer counts down. The ingredients slowly cook (shrimp turns orange, meat browns).
   When the timer ends, the soup boils and it says **Enjoy!**

The running timer is saved in `localStorage`, so it keeps going after a refresh.
Add `?fast` to the URL to make 1 study minute last 1 second, for testing.

## Run locally

It's plain HTML/CSS/JS with no build step. Open `index.html`, or:

```bash
npx serve .
```

## Deploy (GitHub + Vercel)

1. Create an empty GitHub repo, then push:
   ```bash
   git remote add origin https://github.com/cla1reling/malatangtime.git
   git push -u origin main
   ```
2. In Vercel: **Add New → Project → Import** the repo.
   Framework preset: **Other**. Leave the build command empty and the output directory as `./`.
3. Deploy. Every later push to `main` redeploys automatically.

## Files

- `index.html`: page structure for the 5 stages
- `styles.css`: all styling and animations
- `art.js`: hand-drawn SVG art for every ingredient, the pots, the tongs and the bun mascot
- `sauce.js` / `sauce.css`: the Sauce Bar (art, data, tooltips, animations, dipping bowl)
- `app.js`: data (ingredients, weights, broths), drag-and-drop with the tongs, the freezer doors, the scale and the timer
