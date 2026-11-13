local M = {}
local options = { variant = 'dusk', transparent = false, terminal_colors = true, overrides = {} }
local valid = { ["dusk"] = true, ["morning"] = true, ["night"] = true, ["spring"] = true, ["summer"] = true, ["autumn"] = true, ["winter"] = true, ["rain"] = true, ["mist"] = true }

function M.setup(opts)
  options = vim.tbl_deep_extend('force', options, opts or {})
  assert(valid[options.variant], 'Kokedera: unknown variant ' .. tostring(options.variant))
end

function M.palette(variant)
  variant = variant or vim.g.kokedera_variant or options.variant
  assert(valid[variant], 'Kokedera: unknown variant ' .. tostring(variant))
  return vim.deepcopy(require('kokedera.palettes.' .. variant))
end

function M.load(variant)
  variant = variant or vim.g.kokedera_variant or options.variant
  local p = M.palette(variant)
  vim.o.termguicolors = true
  vim.o.background = p.scheme
  vim.cmd('highlight clear')
  if vim.fn.exists('syntax_on') == 1 then vim.cmd('syntax reset') end
  vim.g.colors_name = 'kokedera-' .. variant
  if options.transparent then
    for _, group in ipairs({ 'Normal', 'NormalNC', 'SignColumn', 'LineNr', 'EndOfBuffer' }) do
      p.highlights[group].bg = 'NONE'
    end
  end
  for group, attributes in pairs(options.overrides) do p.highlights[group] = attributes end
  for group, attributes in pairs(p.highlights) do vim.api.nvim_set_hl(0, group, attributes) end
  if options.terminal_colors then
    for index, color in ipairs(p.terminal) do vim.g['terminal_color_' .. (index - 1)] = color end
  end
  M.current = variant
end

return M
