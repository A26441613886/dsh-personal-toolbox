// Local-only XLSX export. Dependency-free OOXML + ZIP STORE; no network, formulas or macros.
// The build inlines these pure functions into the spending client.
export function spendingExcelSheets(data, exportedAt = new Date().toISOString()) {
  const providers = new Map((data.providers || []).map(p => [p.id, p]));
  const prices = data.prices || [], preferences = data.preferences || [];
  const unitOf = unit => ['元', 'CNY', 'USD', '$', '¥', ''].includes(unit || '') ? '元' : unit;
  const identity = (id, key) => {
    const p = providers.get(id);
    return [p?.name || id, p?.keys?.find(k => k.id === key)?.name || key || '默认密钥'];
  };
  const selection = id => {
    const p = providers.get(id), chosen = preferences.find(x => x.provider === id)?.key_id;
    if (chosen === '__exclude__') return '__exclude__';
    return p?.keys?.some(k => k.id === chosen) ? chosen : p?.defaultKey;
  };
  const finite = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const dates = new Map();
  const day = (date, unit) => {
    const id = date + '\t' + unit;
    if (!dates.has(id)) dates.set(id, { date, unit, balance: 0, hasBalance: false, estimate: 0, hasEstimate: false, calls: 0, missing: 0, unpriced: 0 });
    return dates.get(id);
  };
  const balances = [], readings = [];
  for (const [id, entry] of Object.entries(data.ledger || {})) {
    const split = id.indexOf('\t'), provider = split < 0 ? id : id.slice(0, split), key = split < 0 ? '' : id.slice(split + 1);
    const [name, keyName] = identity(provider, key), included = selection(provider) === key;
    for (const [date, units] of Object.entries(entry?.days || {})) {
      for (const [unit, amount] of Object.entries(units || {})) {
        balances.push([date, name, keyName, unit || '未注明', unitOf(unit), finite(amount), included ? '计入' : '未计入', provider, key]);
        if (included && typeof amount === 'number' && amount > 0) { const d = day(date, unitOf(unit)); d.balance += amount; d.hasBalance = true; }
      }
    }
    const samples = [...(entry?.samples || []).map(sample => [sample, '历史采样'])];
    if (entry?.last) samples.push([entry.last, '最新读数']);
    for (const [sample, kind] of samples) {
      if (!Number.isFinite(sample.at)) continue;
      for (const r of sample.readings || []) readings.push([new Date(sample.at).toISOString(), name, keyName, kind, r.unit || '未注明', unitOf(r.unit), finite(r.remaining), finite(r.used), provider, key]);
    }
  }
  const usage = [];
  for (const row of data.rows || []) {
    const p = prices.find(p => p.provider === row.provider && p.model === row.model && p.key_id === row.key_id);
    const hasUsage = row.missing < row.calls;
    const estimate = p && hasUsage ? (row.input * p.input + row.output * p.output + row.cache_read * p.cache_read + row.cache_write * p.cache_write) / 1000000 : null;
    const [providerName, keyName] = identity(row.provider, row.key_id);
    const status = !hasUsage ? '用量全部缺失' : !p ? '未设置单价' : row.missing > 0 ? '部分用量缺失，仅估算已记录部分' : '已估算';
    usage.push([row.day, row.provider_name || providerName, row.model_name || row.model, row.key_name || keyName,
      ({ chat: '普通聊天', intelligence: '智力检测', other: '其他' })[row.source] || row.source,
      row.calls, row.failures, row.missing, row.input, row.output, row.cache_read, row.cache_write,
      estimate, p?.unit || '', p ? unitOf(p.unit) : '', status, p?.input ?? null, p?.output ?? null, p?.cache_read ?? null, p?.cache_write ?? null,
      row.provider, row.model, row.key_id]);
    const d = day(row.day, p ? unitOf(p.unit) : '未定价');
    d.calls += row.calls || 0; d.missing += row.missing || 0; if (!p) d.unpriced += row.calls || 0;
    if (estimate !== null) { d.estimate += estimate; d.hasEstimate = true; }
  }
  const daily = [...dates.values()].sort((a, b) => a.date.localeCompare(b.date) || a.unit.localeCompare(b.unit)).map(d => [d.date, d.unit, d.hasBalance ? d.balance : null, d.hasEstimate ? d.estimate : null, d.calls, d.missing, d.unpriced]);
  balances.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  usage.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  readings.sort((a, b) => a[0].localeCompare(b[0]));
  const sheet = (name, headers, rows, widths, numeric = []) => ({ name, headers, rows, widths, numeric });
  return [
    sheet('阅读说明', ['项目', '内容'], [
      ['账本', 'DeepSeek Harness · 消费账本'], ['导出时间（UTC）', exportedAt], ['范围', '全部已加载历史；不受页面当天、7天、30天筛选限制'],
      ['如何阅读', '每日汇总看趋势；余额明细看各供应商和密钥；模型用量看 Token 与费用估算。标题行已冻结，明细可筛选。'],
      ['统计口径', '余额变化与模型估算是不同口径，不能相加；空金额代表未知或未定价，不是免费。'],
      ['币种提醒', '显示口径沿用界面：元/CNY/USD/$/¥合并显示为元，不代表真实汇率换算。余额明细、模型用量、余额读数与单价设置保留原币种，请据原始币种核账。'],
      ['完整性提醒', '未运行、关闭组件、强制退出或供应商不返回用量时可能缺失；估算仅覆盖有用量且已定价的部分，不替代上游账单。'],
      ['统计密钥', '每日汇总余额只计入当前选择的代表密钥；余额明细仍保留未计入/已删除供应商与密钥的已有记录。'],
      ['余额读数', '包含账本中已有采样与最新读数；最新读数可能与历史采样重复，请勿相加。未到日期不计入每日汇总。'],
      ['单价单位', '每百万 Token；零单价代表明确免费，未设置单价保持空白。'],
      ['隐私', '仅导出账本统计与供应商、模型、密钥名称及内部 ID，不含 API 密钥值、凭据引用、请求地址、对话或模型正文。'],
      ['安全与保存', '本地生成真实.xlsx文件，无宏、公式或外部链接；不修改数据库。这是可读报表，不是可直接恢复的数据库备份。'],
      ['读取状态', [data.writeError, data.balanceError].filter(Boolean).join('；') || '无已报告错误']
    ], [25, 100]),
    sheet('每日汇总', ['日期', '显示币种', '余额变化（统计密钥）', '模型估算（已定价部分）', '请求次数', '缺失用量次数', '未定价请求次数'], daily.filter(r => r[0] <= data.today), [15, 14, 25, 28, 15, 18, 20], [2, 3]),
    sheet('余额明细', ['日期', '供应商', '密钥名称', '原币种', '显示币种', '消费差额', '当前统计', '供应商ID', '密钥ID'], balances, [15, 24, 24, 14, 14, 20, 15, 28, 28], [5]),
    sheet('模型用量', ['日期', '供应商', '模型', '密钥名称', '来源', '请求次数', '失败次数', '缺失用量次数', '输入Token', '输出Token', '缓存读取Token', '缓存写入Token', '费用估算', '原币种', '显示币种', '估算状态', '输入单价/百万', '输出单价/百万', '缓存读取单价/百万', '缓存写入单价/百万', '供应商ID', '模型ID', '密钥ID'], usage, [15, 24, 28, 24, 16, 14, 14, 18, 18, 18, 20, 20, 20, 14, 14, 36, 20, 20, 24, 24, 28, 28, 28], [12, 16, 17, 18, 19]),
    sheet('余额读数', ['时间（UTC）', '供应商', '密钥名称', '记录类型', '原币种', '显示币种', '剩余额度', '已使用额度', '供应商ID', '密钥ID'], readings, [29, 24, 24, 16, 14, 14, 20, 20, 28, 28], [6, 7]),
    sheet('单价设置', ['供应商', '模型', '密钥名称', '原币种', '输入单价/百万', '输出单价/百万', '缓存读取单价/百万', '缓存写入单价/百万', '供应商ID', '模型ID', '密钥ID'], prices.map(p => [identity(p.provider, p.key_id)[0], providers.get(p.provider)?.models?.find(m => m.id === p.model)?.name || p.model, identity(p.provider, p.key_id)[1], p.unit, p.input, p.output, p.cache_read, p.cache_write, p.provider, p.model, p.key_id]), [24, 28, 24, 14, 20, 20, 24, 24, 28, 28, 28], [4, 5, 6, 7]),
    sheet('统计设置', ['供应商', '当前统计', '统计密钥名称', '供应商启用', '供应商ID', '统计密钥ID'], [...providers.values()].map(p => { const key = selection(p.id); return [p.name, key === '__exclude__' ? '排除' : '计入', key === '__exclude__' ? '' : identity(p.id, key)[1], p.enabled === false ? '已停用' : '已启用', p.id, key === '__exclude__' ? '' : key]; }), [24, 16, 24, 16, 28, 28])
  ];
}

export function spendingExcelBytes(sheets) {
  const xml = value => String(value ?? '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const column = index => { let name = ''; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + (n - 1) % 26) + name; return name; };
  const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  if (!sheets.length || sheets.length > 65535) throw Error('Excel 工作表数量超限');
  const names = new Set();
  const files = new Map();
  sheets.forEach((sheet, index) => {
    if (!sheet.name || sheet.name.length > 31 || /[\\/\[\]:?*]/.test(sheet.name) || names.has(sheet.name)) throw Error('Excel 工作表名称无效');
    names.add(sheet.name);
    if (!sheet.headers.length || sheet.headers.length > 16384 || sheet.rows.length > 1048575) throw Error('Excel 行列超过上限，未截断记录');
    const last = column(sheet.headers.length - 1) + (sheet.rows.length + 1);
    const rows = [sheet.headers, ...sheet.rows].map((row, r) => {
      const cells = row.map((value, c) => {
        if (c >= sheet.headers.length) throw Error('Excel 数据列超过标题列');
        const ref = column(c) + (r + 1);
        const style = !r ? 1 : typeof value === 'number' ? (sheet.numeric.includes(c) ? (r % 2 ? 4 : 5) : (r % 2 ? 6 : 7)) : (r % 2 ? 2 : 3);
        if (value == null) return `<c r="${ref}" s="${style}"/>`;
        if (typeof value === 'number') return Number.isFinite(value) ? `<c r="${ref}" s="${style}"><v>${value}</v></c>` : `<c r="${ref}" s="${style}"/>`;
        if (String(value).length > 32767) throw Error('单元格内容超过 Excel 上限，未截断记录');
        // inlineStr deliberately prevents Excel from executing names beginning with =,+,-,@.
        return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}"${!r ? ' ht="30" customHeight="1"' : sheet.name === '阅读说明' ? ' ht="60" customHeight="1"' : ''}>${cells}</row>`;
    }).join('');
    files.set(`xl/worksheets/sheet${index + 1}.xml`, declaration + `<worksheet xmlns="${ns}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="24"/><cols>${sheet.headers.map((_, c) => `<col min="${c + 1}" max="${c + 1}" width="${sheet.widths[c] || 20}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData>${sheet.name === '阅读说明' ? '' : `<autoFilter ref="A1:${last}"/>`}<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="9"/></worksheet>`);
  });
  const xf = (font, fill, numFmt) => `<xf numFmtId="${numFmt}" fontId="${font}" fillId="${fill}" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="center" wrapText="1"${numFmt ? ' horizontal="right"' : ''}/></xf>`;
  files.set('xl/styles.xml', declaration + `<styleSheet xmlns="${ns}"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00##"/></numFmts><fonts count="2"><font><sz val="11"/><color rgb="FF263445"/><name val="Microsoft YaHei"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF186C78"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF0F6F7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8">${xf(0, 0, 0)}${xf(1, 2, 0)}${xf(0, 0, 0)}${xf(0, 3, 0)}${xf(0, 0, 164)}${xf(0, 3, 164)}${xf(0, 0, 3)}${xf(0, 3, 3)}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`);
  files.set('xl/workbook.xml', declaration + `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
  const relNs = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const relType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  files.set('xl/_rels/workbook.xml.rels', declaration + `<Relationships xmlns="${relNs}">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${relType}worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="${relType}styles" Target="styles.xml"/></Relationships>`);
  files.set('_rels/.rels', declaration + `<Relationships xmlns="${relNs}"><Relationship Id="rId1" Type="${relType}officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  files.set('[Content_Types].xml', declaration + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
  return spendingExcelZip(files);
}

export function spendingExcelZip(files) {
  const encoder = new TextEncoder(), local = [], central = [];
  let offset = 0, centralSize = 0;
  const crcTable = Uint32Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  const crc32 = bytes => { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; };
  const header = size => { const bytes = new Uint8Array(size); return [bytes, new DataView(bytes.buffer)]; };
  for (const [name, body] of files) {
    const file = encoder.encode(body), filename = encoder.encode(name), crc = crc32(file);
    if (file.length > 0xffffffff || offset + file.length + filename.length + 30 > 0xffffffff) throw Error('Excel 文件过大，未截断记录');
    const [lh, l] = header(30);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x800, true); l.setUint16(12, 0x5021, true);
    l.setUint32(14, crc, true); l.setUint32(18, file.length, true); l.setUint32(22, file.length, true); l.setUint16(26, filename.length, true);
    local.push(lh, filename, file);
    const [ch, c] = header(46);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(14, 0x5021, true);
    c.setUint32(16, crc, true); c.setUint32(20, file.length, true); c.setUint32(24, file.length, true); c.setUint16(28, filename.length, true); c.setUint32(42, offset, true);
    central.push(ch, filename); centralSize += ch.length + filename.length;
    offset += lh.length + filename.length + file.length;
  }
  if (files.size > 65535 || offset + centralSize + 22 > 0xffffffff) throw Error('Excel 文件过大，未截断记录');
  const [eh, e] = header(22);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.size, true); e.setUint16(10, files.size, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  const bytes = new Uint8Array(offset + centralSize + eh.length);
  let cursor = 0; for (const part of [...local, ...central, eh]) { bytes.set(part, cursor); cursor += part.length; }
  return bytes;
}
