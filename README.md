<h1 align="center">Selectivizr 2</h1>
<p align="center">
  :sparkles: Now with maintenance! :sparkles:
</p>

### What happened to the old project?
[Keith Clark](https://github.com/keithclark) was eaten alive by sabre-tooth rattlesnakes or something. Who knows?

Good on him for originally inventing this though. :beers:

### Why support old IE?
Why completely turn your back on it? I'm not saying give it special attention (unless you're making a website for [the most populated country in the world](https://www.techinasia.com/windows-xp-now-dead-but-200-million-machines-in-china-still-using-it)), but why not toss some polyfills in conditional comments and at least give the poor bastards who are stuck on IE6-IE8 *something* to look at.

It requires almost 0 effort on your part and can make your website viewable to a lot of people.

### What is Selectivizr?
Selectivizr is a [polyfill](https://en.wikipedia.org/wiki/Polyfill) that makes IE6-8 work with most [CSS3 selectors](https://www.w3.org/TR/selectors/#selectors) (like `:nth-child`).

### Installation
- `bower install --save selectivizr2`

### Usage
To use the library, you'll need to include one of the supported libraries _before_ Selectivizr:

- jQuery (1.3+)
- Dojo (1.5.0+)
- Prototype (1.6.1+)
- Yahoo UI Library (2.8.0+)
- DOMAssistant (2.8.0+)
- MooTools (1.3+)
- NWMatcher (1.2.3+)

Then add the following conditional comment **after** your stylesheets:

```html
<!--[if lt IE 9]>
  <script src="selectivizr2.js"></script>
<![endif]-->
```

That's it. That's how polyfills typically work. Load the .js and [bam](https://www.youtube.com/watch?v=8dxpMxULHnA)!

The only people downloading this file will be people below IE8. This means we're not punishing people using modern browsers.

### Contribute!
TBH, I'm not an amazing JS developer yet, so I really have no idea wtf is going on. I'm happy to merge stuff as long as it seems legit but I'm probably not going to spend a ton of time working on this codebase.
