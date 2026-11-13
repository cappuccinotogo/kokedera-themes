local k = require('kokedera')
local c = k.palette(k.current).colors
local function mode(accent)
  return { a = { fg = c.background, bg = accent, gui = 'bold' },
    b = { fg = c.foreground, bg = c.bgActive }, c = { fg = c.textMuted, bg = c.bgSurface } }
end
return { normal = mode(c.bamboo), insert = mode(c.stream), visual = mode(c.wisteria),
  replace = mode(c.torii), command = mode(c.lantern), inactive = mode(c.textMuted) }
