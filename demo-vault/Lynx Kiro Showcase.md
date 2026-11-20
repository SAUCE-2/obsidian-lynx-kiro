---
tags: [theme, showcase]
status: in-progress
created: 2026-11-20
---

# Lynx Kiro Showcase

A tour of the **Lynx Kiro** theme: *italic text*, ***bold italic***, ~~strikethrough~~, ==highlighted text==, `inline code`, and a footnote.[^1]

Links: [[Theme Port Plan]], [[Color Palette|the palette]], [[A note that does not exist]], an [external link](https://github.com/bastndev/Lynx-Theme-Pro), and tags like #theme, #obsidian/dark and #kiro.

## Second-level heading

### Third-level heading

#### Fourth-level heading

##### Fifth-level heading

###### Sixth-level heading

> A plain blockquote. Lynx Kiro keeps it quiet, with an accent border.

---

## Lists and tasks

- Unordered item
	- Nested item with **bold**
		- Deeper still
1. First
2. Second
3. Third

- [ ] To do
- [x] Done
- [/] In progress
- [-] Cancelled
- [>] Forwarded
- [<] Scheduled
- [?] Question
- [!] Important
- [*] Star
- ["] Quote
- [i] Information
- [I] Idea
- [b] Bookmark
- [l] Location
- [S] Savings
- [p] Pro
- [c] Con
- [f] Fire
- [k] Key
- [w] Win
- [u] Up
- [d] Down

## Table

| Token      | Color     | Used for          |
| :--------- | :-------- | :---------------- |
| Keyword    | `#d0b0ff` | `const`, `fn`     |
| Function   | `#9898e0` | function names    |
| String     | `#40d4b8` | string literals   |
| Number     | `#e8c547` | numbers and dates |
| Property   | `#6ec8f5` | keys, properties  |

## Code

```typescript
// Load the active theme and log its accent color.
interface Theme {
  name: string;
  accent: `#${string}`;
  dark: boolean;
}

export async function loadTheme(name: string): Promise<Theme> {
  const res = await fetch(`/themes/${name}.json`);
  if (!res.ok) throw new Error(`Theme ${name} not found`);
  return { ...(await res.json()), dark: true } as Theme;
}
```

```python
from dataclasses import dataclass

@dataclass
class Swatch:
    name: str
    hex: str
    contrast: float = 4.5

def brightest(swatches: list[Swatch]) -> Swatch:
    """Return the swatch with the highest contrast ratio."""
    return max(swatches, key=lambda s: s.contrast)
```

```toml
[theme]
name = "Lynx Kiro"
version = "1.1.0"
dark = true
released = 2026-11-20

[palette]
accent = "#a78bfa"
keyword = "#d0b0ff"
contrast = 7.2
```

## Callouts

> [!note] Note
> The default callout, for side remarks.

> [!abstract] Abstract
> Summary, TL;DR.

> [!info] Info
> Useful background information.

> [!todo] Todo
> Something still to do.

> [!tip] Tip
> A helpful hint. Also `hint` and `important`.

> [!success] Success
> It worked. Also `check` and `done`.

> [!question] Question
> Open question? Also `help` and `faq`.

> [!warning] Warning
> Be careful. Also `caution` and `attention`.

> [!failure] Failure
> It did not work. Also `fail` and `missing`.

> [!danger] Danger
> Something risky. Also `error`.

> [!bug] Bug
> A known bug.

> [!example] Example
> An example of the thing.

> [!quote] Quote
> "Simplicity is prerequisite for reliability." Also `cite`.

> [!tip]- Foldable callout
> Hidden until you open it.

## Math and embeds

Inline math $e^{i\pi} + 1 = 0$ and a block:

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

![[Color Palette#Accents]]

[^1]: Footnotes render at the bottom of the note in reading view.
