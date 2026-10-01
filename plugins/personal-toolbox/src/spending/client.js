window.__ModuleLoader__.load({
  id: "@local/dsh-personal-spending",
  factory: (require) => {
    const React = require('react');
    const h = React.createElement;
    /*SPENDING_EXCEL*/
    const money = value => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const number = value => Number(value || 0).toLocaleString('zh-CN');
    const priceOf = (data, row) => data.prices.find(p => p.provider === row.provider && p.model === row.model && p.key_id === row.key_id);
    const modelKey = (p, m) => (p.id !== 'deepseek-official' ? p.keys.find(k => k.id === m.key) : null) || p.keys.find(k => k.id === p.requestKey) || { id: 'legacy-default', name: '默认密钥' };
    // 界面样式表的可读源码是 plugins/personal-toolbox/src/spending/style.css；
    // 构建器把它内联到下面这个占位符，因此运行时不需要额外请求。
    const spendingCss = [
'/*SPENDING_CSS*/'
    ].join('');
    let styleInjected = false;
    const injectStyle = () => {
      if (styleInjected) return; styleInjected = true;
      const tagId = '@local/dsh-personal-spending/spending.css';
      if (typeof document === 'undefined' || document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') !== null) return;
      const tag = document.createElement('style');
      tag.dataset.plugin = '@local/dsh-personal-spending';
      tag.dataset.pluginCss = tagId;
      tag.textContent = spendingCss;
      document.head.appendChild(tag);
    };
    const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const CHART_H = 88;
    // 余额总览只按人民币展示。查询配置里的 USD、CNY、$、¥ 都是同一笔人民币的不同写法，
    // 展示前折成「元」，避免同一天的金额被拆成多个币种。
    const yuanUnit = unit => ['元', 'CNY', 'USD', '$', '¥', ''].includes(unit || '') ? '元' : unit;
    const unitText = unit => yuanUnit(unit) === '元' ? '元' : unit;
    const chartBarHeight = (value, max) => (!max || !(value > 0) ? 3 : Math.max(4, Math.round(value / max * CHART_H)));
    // React 只接受带单位的像素高度，无单位的数字会被丢弃，因此统一补上 px。
    const barStyle = (value, max) => ({ height: `${chartBarHeight(value, max)}px` });
    const fromAgo = at => {
      const seconds = Math.round((Date.now() - at) / 1000);
      if (seconds < 60) return '刚刚';
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return `${minutes} 分钟前`;
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours} 小时前`;
      return new Date(at).toLocaleDateString('zh-CN');
    };
    const roundSpend = value => Math.round(Number(value) * 100) / 100;
    const spendFromReadings = (previous, next) => {
      if (!next) return 0;
      if (previous?.unit && next.unit && yuanUnit(previous.unit) !== yuanUnit(next.unit)) return 0;
      if (typeof next.used === 'number' && typeof previous?.used === 'number' && next.used >= previous.used - 1e-9) return roundSpend(Math.max(0, next.used - previous.used));
      if (typeof next.remaining === 'number' && typeof previous?.remaining === 'number' && next.remaining <= previous.remaining + 1e-9) return roundSpend(Math.max(0, previous.remaining - next.remaining));
      return 0;
    };
    // Provider readings and token estimates describe different measurements; never add them together.
    function spendingView(data, days, mode) {
      const today = new Date(`${data.today}T12:00:00`);
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
      const since = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const lines = new Map(), totals = new Map();
      const add = (map, unit, amount) => map.set(unit, (map.get(unit) || 0) + Number(amount || 0));
      for (const p of data.providers) {
        const chosen = data.preferences.find(x => x.provider === p.id)?.key_id;
        if (chosen === '__exclude__') continue;
        const key = p.keys.some(x => x.id === chosen) ? chosen : p.defaultKey;
        const entry = data.ledger[`${p.id}\t${key}`];
        for (const [date, units] of Object.entries(entry?.days || {})) {
          if (date < since || date > data.today) continue;
          let line = lines.get(date); if (!line) lines.set(date, line = { date, providers: new Map(), models: [] });
          let sum = line.providers.get(p.id); if (!sum) line.providers.set(p.id, sum = { name: p.name, units: new Map(), key });
          for (const [unit, amount] of Object.entries(units)) if (Number(amount) > 0) { add(sum.units, yuanUnit(unit), amount); add(totals, yuanUnit(unit), amount); }
        }
      }
      for (const row of data.rows) {
        if (row.day < since || row.day > data.today) continue;
        let line = lines.get(row.day); if (!line) lines.set(row.day, line = { date: row.day, providers: new Map(), models: [] });
        const p = priceOf(data, row);
        const estimate = p && row.missing < row.calls ? ((row.input * p.input + row.output * p.output + row.cache_read * p.cache_read + row.cache_write * p.cache_write) / 1000000) : null;
        line.models.push({ ...row, unit: p ? yuanUnit(p.unit) : undefined, estimate });
      }
      const primary = mode === 'actual';
      const dayTotal = line => {
        const sums = new Map();
        if (!line) return sums;
        if (primary) line.providers.forEach(p => p.units.forEach((value, unit) => add(sums, unit, value)));
        else line.models.forEach(row => { if (row.estimate !== null) add(sums, row.unit, row.estimate); });
        return sums;
      };
      // 当天视图使用每次余额采样；旧账本没有采样时间时，只能保留全天合计一个点。
      const intraday = new Map();
      if (primary && days === 1) {
        const chosenKeys = new Map();
        for (const p of data.providers) {
          const chosen = data.preferences.find(x => x.provider === p.id)?.key_id;
          if (chosen === '__exclude__') continue;
          chosenKeys.set(`${p.id}\t${p.keys.some(x => x.id === chosen) ? chosen : p.defaultKey}`, p.name);
        }
        const events = [];
        for (const [id, providerName] of chosenKeys) {
          for (const sample of data.ledger[id]?.samples || []) {
            if (!Number.isFinite(sample.at) || new Date(sample.at).toLocaleDateString('sv-SE') !== data.today) continue;
            for (const reading of sample.readings || []) events.push({ at: sample.at, unit: yuanUnit(reading.unit), reading, provider: providerName });
          }
        }
        const previous = new Map();
        for (const event of events.sort((a, b) => a.at - b.at)) {
          const key = `${event.provider}\t${event.unit}`;
          const spend = spendFromReadings(previous.get(key), event.reading);
          previous.set(key, event.reading);
          if (!(spend > 0)) continue;
          const point = intraday.get(event.at) || intraday.set(event.at, { date: data.today, at: event.at, units: new Map() }).get(event.at);
          add(point.units, event.unit, spend);
        }
      }
      // 趋势图按天汇总：一天一根柱，柱高是当天全部供应商的合计。
      const sorted = [...lines.values()].sort((a, b) => b.date.localeCompare(a.date));
      const series = new Map();
      // 日期轴由余额差额和模型用量共同决定，只有模型用量的日子也要出现在图里。
      const daysOf = [...lines.keys()].sort();
      const isToday = date => date === data.today;
      const compare = (a, b) => a.date.localeCompare(b.date);
      for (const line of sorted) {
        const sums = dayTotal(line);
        for (const [unit, value] of sums) {
          if (!(value > 0)) continue;
          const entry = series.get(unit) || series.set(unit, { unit, max: 0, points: [] }).get(unit);
          entry.points.push({ date: line.date, value, provider: '', dayTotal: value });
        }
      }
      // 补齐没有该币种记录的日期，让柱子的间距始终代表真实的一天。
      for (const entry of series.values()) {
        const blanks = daysOf.filter(date => !entry.points.some(point => point.date === date)).map(date => ({ date, value: 0, provider: '', dayTotal: 0 }));
        entry.points = [...entry.points, ...blanks].sort(compare);
        entry.max = entry.points.reduce((max, point) => Math.max(max, point.value), 0);
      }
      // 今日相对上一个有记录的日期，仅在与那天都有读数时给出；估算口径不做这种对比。
      const todayTotals = dayTotal(lines.get(data.today));
      const previousDate = daysOf[daysOf.length - 1] === data.today ? daysOf[daysOf.length - 2] : daysOf[daysOf.length - 1];
      const previousTotals = primary && previousDate ? dayTotal(lines.get(previousDate)) : new Map();
      const deltas = [...todayTotals].flatMap(([unit, value]) => {
        if (!previousTotals.has(unit)) return [];
        const before = previousTotals.get(unit) || 0, change = value - before;
        if (Math.abs(change) < 1e-9) return [];
        return [{ unit, change, ratio: before > 0 ? change / before : null }];
      });
      // 所选时段合计：估算口径只统计已定价的模型用量。
      const estimatedTotals = new Map();
      for (const line of sorted) for (const row of line.models) if (row.estimate !== null) add(estimatedTotals, row.unit, row.estimate);
      const timeline = [...intraday.values()].sort((a, b) => a.at - b.at);
      const intradaySeries = new Map();
      for (const point of timeline) for (const [unit, value] of point.units) {
        const entry = intradaySeries.get(unit) || intradaySeries.set(unit, { unit, max: 0, points: [] }).get(unit);
        entry.points.push({ date: data.today, at: point.at, value, provider: '', dayTotal: value });
        entry.max = Math.max(entry.max, value);
      }
      return { lines: sorted, series: [...series.values()].filter(entry => entry.points.some(point => point.value > 0)), intraday: [...intradaySeries.values()], totals, todayTotals, estimatedTotals, deltas, since: daysOf[0] && daysOf[0] > since ? daysOf[0] : since, days, mode };
    }
    const formatUnits = units => units.size ? [...units].map(([unit, amount]) => `${money(amount)} ${unit}`).join(' / ') : '暂无记录';
    // plugins/personal-toolbox/tests/verify-personal-spending.mjs 用这一行切出上面的纯计算部分单独回归，勿改其内容与位置。
    const section = {};
    // ---------------------------------------------------------------- 小组件
    function Amount({ units, size, hint }) {
      const list = [...units].filter(([, value]) => Number.isFinite(value));
      if (!list.length) return h('p', { className: 'dsh-sp__kpiEmpty' }, hint || '暂无记录');
      return h('div', { className: 'dsh-sp__kpiRow' },
        list.map(([unit, value], index) => h('span', { key: unit, className: size === 'sm' ? 'dsh-sp__kpi dsh-sp__kpi--sm' : 'dsh-sp__kpi', style: index ? { fontSize: size === 'sm' ? 20 : 26 } : undefined },
          money(value), h('span', { className: size === 'sm' ? 'dsh-sp__unit dsh-sp__unit--sm' : 'dsh-sp__unit' }, unitText(unit)))));
    }
    function Meter({ ratio }) {
      const width = Math.max(2, Math.min(100, Math.round((Number(ratio) || 0) * 100)));
      return h('div', { className: 'dsh-sp__meter', role: 'presentation' }, h('div', { className: 'dsh-sp__meterFill', style: { width: `${width}%` } }));
    }
    function Chip({ tone, children, title }) {
      return h('span', { className: `dsh-sp__chip${tone ? ` dsh-sp__chip--${tone}` : ''}`, title }, children);
    }
    function TrendLine({ points, max }) {
      const width = 720, height = 180, pad = 16;
      const peak = Math.max(max, 0.01);
      const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
      const coords = points.map((point, index) => {
        const x = points.length > 1 ? pad + step * index : width / 2;
        const y = height - pad - (point.value / peak) * (height - pad * 2);
        return { ...point, x, y };
      });
      const path = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
      return h('svg', { className: 'dsh-sp__line', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `当天按采样时间记录的消费，共 ${points.length} 个时间点` },
        h('path', { d: path, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }),
        coords.map((point, index) => h('circle', { key: point.at || index, cx: point.x, cy: point.y, r: 3.5 },
          h('title', {}, `${new Date(point.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} ${money(point.value)}`))));
    }
    function TrendChart({ view }) {
      const [active, setActive] = React.useState(null);
      const [hover, setHover] = React.useState(null);
      if (view.days === 1 && view.mode === 'actual') {
        if (!view.intraday?.length) return h('p', { className: 'dsh-sp__empty' }, '今天还没有按时间保存的余额采样。之后每次自动刷新或手动刷新都会记录一个时间点。');
        const groups = active ? view.intraday.filter(entry => entry.unit === active) : [view.intraday[0]];
        const entry = groups[0];
        return h('div', {},
          h('div', { className: 'dsh-sp__legend' },
            view.intraday.length > 1 && h('div', { className: 'dsh-sp__seg', role: 'group', 'aria-label': '选择币种' },
              view.intraday.map(item => h('button', { key: item.unit, type: 'button', 'aria-pressed': entry.unit === item.unit, onClick: () => setActive(item.unit) }, unitText(item.unit)))),
            h('span', { className: 'dsh-sp__legendItem' }, h('span', { className: 'dsh-sp__swatch' }), `${unitText(entry.unit)} 采样消费`, h('span', { className: 'dsh-sp__legendValue' }, `${entry.points.length} 个时间点`))),
          h(TrendLine, { points: entry.points, max: entry.max }),
          h('div', { className: 'dsh-sp__axis', 'aria-hidden': true },
            entry.points.map((point, index) => h('span', { key: point.at, className: 'dsh-sp__axisTick' },
              entry.points.length > 8 && index % Math.ceil(entry.points.length / 6) !== 0 ? '' : new Date(point.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })))),
          h('p', { className: 'dsh-sp__footNote' }, '每个点是一次余额采样相对上次采样的消费；点按当天时间排列。过去没有保存采样时间的记录不会被回填。'));
      }
      if (!view.series.length) return h('p', { className: 'dsh-sp__empty' }, '所选时间段还没有可绘制的记录；刷新已配置的余额，或在模型产生用量后查看。');
      const groups = active ? view.series.filter(entry => entry.unit === active) : view.series;
      const unit = groups[0]?.unit || view.series[0].unit;
      const points = groups.flatMap(entry => entry.points);
      const max = groups.reduce((value, entry) => Math.max(value, entry.max), 0);
      const seriesLabel = view.mode === 'actual' ? '余额差额' : '模型估算';
      const hoverPoint = hover === null ? null : points[hover];
      return h('div', {},
        h('div', { className: 'dsh-sp__legend' },
          view.series.length > 1 && h('div', { className: 'dsh-sp__seg', role: 'group', 'aria-label': '选择币种' },
            h('button', { type: 'button', 'aria-pressed': !active, onClick: () => setActive(null) }, '全部'),
            view.series.map(entry => h('button', { key: entry.unit, type: 'button', 'aria-pressed': active === entry.unit, onClick: () => setActive(entry.unit) }, unitText(entry.unit)))),
          groups.map(entry => h('span', { key: entry.unit, className: 'dsh-sp__legendItem' },
            h('span', { className: 'dsh-sp__swatch' }), `${unitText(entry.unit)} ${seriesLabel}`,
            h('span', { className: 'dsh-sp__legendValue' }, `${money(entry.max)} 峰值`)))),
        hoverPoint && h('p', { className: 'dsh-sp__readout', role: 'status' },
          h('span', {}, hoverPoint.date === view.today ? '今天' : hoverPoint.date),
          h('strong', {}, `${money(hoverPoint.value)} ${unitText(unit)}`)),
        h('div', { className: 'dsh-sp__chart', onMouseLeave: () => setHover(null) },
          h('div', { className: 'dsh-sp__bars', role: 'img', 'aria-label': `${seriesLabel}逐日趋势，共 ${points.length} 个数据点` },
            points.map((point, index) => {
              const stack = groups.map(entry => ({ unit: entry.unit, value: entry.points.filter(candidate => candidate.date === point.date).reduce((sum, candidate) => sum + candidate.value, 0) })).filter(item => item.value > 0);
              const isToday = point.date === view.today;
              const label = `${point.date === view.today ? '今天 · ' : ''}${point.date}：${money(point.value)} ${unitText(unit)}`;
              return h('div', {
                key: `${point.date}-${index}`, className: 'dsh-sp__barCol', tabIndex: 0,
                'data-empty': !(point.value > 0), 'data-today': isToday, 'data-hover': hover === index, 'aria-label': label,
                onMouseEnter: () => setHover(index), onFocus: () => setHover(index), onClick: () => setHover(index)
              },
                stack.map(item => h('span', { key: item.unit, className: 'dsh-sp__bar', style: barStyle(item.value, max) })),
                !(point.value > 0) && h('span', { className: 'dsh-sp__bar dsh-sp__bar--empty', 'aria-hidden': true }));
            })),
          h('div', { className: 'dsh-sp__axis', 'aria-hidden': true },
            points.map((point, index) => h('span', { key: `${point.date}-${index}`, className: 'dsh-sp__axisTick' },
              points.length > 16 && index % Math.ceil(points.length / 8) !== 0 ? '' : point.date.slice(5))))),
        h('p', { className: 'dsh-sp__footNote' }, view.mode === 'actual'
          ? '每根柱子是一天的总花费，已把当天各供应商选定密钥的余额差额加在一起；鼠标移到柱子上显示当天合计。'
          : '每根柱子是一天的模型估算合计；按请求返回的 token 数与单价计算，缺少用量或未设单价的请求不显示为免费。'));
    }
    function PriceDialog({ editor, form, setForm, error, busy, onClose, onSave }) {
      const fields = [['unit', '币种', '如 元 / USD'], ['input', '输入', '每百万 token'], ['output', '输出', '每百万 token'], ['cache_read', '缓存读取', '每百万 token'], ['cache_write', '缓存写入', '每百万 token']];
      const invalid = key => key !== 'unit' && form[key] !== '' && (!Number.isFinite(Number(form[key])) || Number(form[key]) < 0);
      return h('div', { className: 'dsh-sp__backdrop', role: 'presentation', onClick: onClose },
        h('div', {
          className: 'dsh-sp__dialog', role: 'dialog', 'aria-modal': true, 'aria-label': '编辑模型单价',
          onClick: event => event.stopPropagation(),
          onKeyDown: event => {
            if (event.key !== 'Tab') return;
            const nodes = [...event.currentTarget.querySelectorAll('input,button:not(:disabled)')];
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        },
        h('div', { className: 'dsh-sp__dialogHead' },
          h('div', {},
            h('h3', { className: 'dsh-sp__dialogTitle' }, '模型单价'),
            h('p', { className: 'dsh-sp__dialogSub' }, '按每百万 token 填写；同一模型绑定不同密钥时分别配置。')),
          h('button', { type: 'button', className: 'dsh-sp__close', onClick: onClose, 'aria-label': '关闭' }, '✕')),
        h('dl', { className: 'dsh-sp__identity' },
          [['供应商', editor.provider_name], ['模型', editor.model_name], ['密钥', editor.key_name]].map(([label, value]) => h('div', { key: label, className: 'dsh-sp__identityRow' },
            h('dt', {}, label), h('dd', { title: value }, value)))),
        error && h('div', { className: 'dsh-sp__alert', role: 'alert', style: { marginTop: 12 } }, h('span', {}, error)),
        h('div', { className: 'dsh-sp__priceGrid' },
          fields.map(([key, label, hint]) => h('label', { key, className: `dsh-sp__priceField${key === 'unit' ? ' dsh-sp__priceField--full' : ''}` },
            h('span', {}, label, ' ', h('em', {}, hint)),
            h('input', {
              className: 'dsh-sp__input', autoFocus: key === 'unit', type: key === 'unit' ? 'text' : 'number',
              min: key === 'unit' ? undefined : 0, step: 'any', value: form[key], 'aria-invalid': invalid(key) ? 'true' : undefined,
              onChange: event => setForm({ ...form, [key]: event.target.value })
            })))),
        h('p', { className: 'dsh-sp__hint' }, '保存后会按该线路单价重算全部历史估算；不会改写上游账单，也不影响已记录的 token 用量。'),
        h('div', { className: 'dsh-sp__dialogFoot' },
          h('button', { type: 'button', className: 'dsh-sp dsh-sp--ghost', onClick: onClose }, '取消'),
          h('button', { type: 'button', className: 'dsh-sp dsh-sp--primary', disabled: busy || fields.some(([key]) => invalid(key)), onClick: onSave }, busy ? '保存中…' : '保存单价'))));
    }
    // 每日明细的一行；把大段嵌套从页面 JSX 中抽出来，便于维护与阅读。
    function renderSpendingDay({ line, sums, primary, open, today, meters, edit, toggleOpen }) {
      const date = new Date(`${line.date}T12:00:00`);
      const estimated = line.models.filter(row => row.estimate === null && row.missing < row.calls).length;
      const [year, month, day] = line.date.split('-');
      const head = h('button', { type: 'button', className: 'dsh-sp__dayHead', onClick: toggleOpen, 'aria-expanded': open },
        h('span', { className: 'dsh-sp__dayStamp' },
          h('span', { className: 'dsh-sp__dayNum' }, day),
          h('span', { className: 'dsh-sp__dayMonth' }, `${year}-${month}`)),
        h('span', { className: 'dsh-sp__dayWhen' },
          h('span', { className: 'dsh-sp__dayDow' }, WEEK[date.getDay()]),
          line.date === today && h('span', { className: 'dsh-sp__todayTag' }, '今天')),
        h('span', { className: sums.size ? 'dsh-sp__dayAmount' : 'dsh-sp__dayAmount muted' }, formatUnits(sums)),
        h('span', { className: 'dsh-sp__dayMeta' }, primary
          ? `${line.providers.size} 个供应商有记录`
          : `${line.models.length} 条用量${estimated ? ` · ${estimated} 项未定价` : ''}`),
        h('span', { className: 'dsh-sp__caret', 'aria-hidden': true }, '▾'));
      const providerRows = [...line.providers].map(([id, p]) => h('div', { key: id, className: 'dsh-sp__rowLine' },
        h('span', { className: 'dsh-sp__rowName', title: `${p.name} · ${p.key}` },
          p.name, h('span', { className: 'dsh-sp__cellSub' }, ` · ${p.key}`)),
        h(Meter, { ratio: meters.get(`${line.date}\t${id}`) || 0 }),
        h('span', { className: 'dsh-sp__rowAmount' }, formatUnits(p.units))));
      const modelHead = h('thead', {}, h('tr', {},
        h('th', {}, '供应商 / 模型'), h('th', {}, '密钥'),
        h('th', { className: 'dsh-sp__num' }, '输入 token'), h('th', { className: 'dsh-sp__num' }, '输出 token'),
        h('th', { className: 'dsh-sp__num' }, '缓存读 / 写'), h('th', { className: 'dsh-sp__num' }, '请求 / 无用量'),
        h('th', { className: 'dsh-sp__num' }, '估算费用'), h('th', {}, '')));
      const modelRows = h('tbody', {}, line.models.map(row => h('tr', {
        key: [row.provider, row.model, row.key_id, row.source].join(':'),
        'data-active': row.estimate === null && row.missing < row.calls
      },
        h('td', {}, h('div', { className: 'dsh-sp__cellStack' },
          h('span', { className: 'dsh-sp__cellStrong', title: `${row.provider_name} / ${row.model_name}` }, row.model_name),
          h('span', { className: 'dsh-sp__cellSub' },
            row.provider_name,
            row.source === 'intelligence' ? h('span', { className: 'dsh-sp__tag' }, '检测')
              : row.source === 'chat' ? h('span', { className: 'dsh-sp__tag' }, '对话') : null))),
        h('td', {}, h('span', { className: 'dsh-sp__cellSub' }, row.key_name)),
        h('td', { className: 'dsh-sp__num' }, row.missing === row.calls ? h('span', { className: 'dsh-sp__minus' }, '未返回') : number(row.input)),
        h('td', { className: 'dsh-sp__num' }, row.missing === row.calls ? h('span', { className: 'dsh-sp__minus' }, '—') : number(row.output)),
        h('td', { className: 'dsh-sp__num' }, h('span', { className: 'dsh-sp__cellSub' }, `${number(row.cache_read)} / ${number(row.cache_write)}`)),
        h('td', { className: 'dsh-sp__num' }, h('span', { className: 'dsh-sp__cellSub' }, `${row.calls} / ${row.missing}`)),
        h('td', { className: 'dsh-sp__num' }, row.missing === row.calls ? h('span', { className: 'dsh-sp__minus' }, '未返回用量')
          : row.estimate == null ? h(Chip, { tone: 'warn' }, '未设置单价')
            : `${money(row.estimate)} ${unitText(row.unit)}${row.missing ? '（部分）' : ''}`),
        h('td', { className: 'dsh-sp__num' }, h('button', { type: 'button', className: 'dsh-sp dsh-sp--ghost dsh-sp--sm', onClick: () => edit(row) }, '单价')))));
      const modelFoot = h('tfoot', {}, h('tr', {},
        h('td', { colSpan: 6 }, '本日合计（已定价部分）'),
        h('td', { className: 'dsh-sp__num' }, formatUnits(sums)),
        h('td', {}, '')));
      const body = primary
        ? (line.providers.size ? providerRows : h('p', { className: 'dsh-sp__meta' }, '当天没有余额差额记录'))
        : h('div', { className: 'dsh-sp__tableWrap' }, h('table', { className: 'dsh-sp__table' }, modelHead, modelRows, modelFoot));
      return { head, body };
    }
    function SpendingCalendar({ lines, primary, openDays, setOpenDays, today, meters, edit, toggleOpen }) {
      const ordered = [...lines].sort((a, b) => a.date.localeCompare(b.date));
      const byDate = new Map(ordered.map(line => [line.date, line]));
      const months = [];
      for (const line of ordered) {
        const month = line.date.slice(0, 7);
        if (months.at(-1)?.month !== month) months.push({ month, dates: [] });
        months.at(-1).dates.push(line.date);
      }
      const [monthIndex, setMonthIndex] = React.useState(months.length - 1);
      const selected = Math.min(Math.max(monthIndex, 0), months.length - 1);
      const group = months[selected];
      if (!group) return null;
      const renderMonth = group => {
        const [year, month] = group.month.split('-').map(Number);
        const first = new Date(year, month - 1, 1);
        const count = new Date(year, month, 0).getDate();
        const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
        const recorded = group.dates.filter(date => byDate.get(date)?.providers.size || byDate.get(date)?.models.length).length;
        const opened = group.dates.find(date => openDays.has(date));
        const openedLine = opened ? byDate.get(opened) : null;
        const openedDetail = openedLine ? renderSpendingDay({ line: openedLine, sums: openedLine.sums, primary, open: true, today, meters, edit, toggleOpen }) : null;
        return h('section', { key: group.month, className: 'dsh-sp__month' },
          h('div', { className: 'dsh-sp__monthHead' },
            h('button', { type: 'button', className: 'dsh-sp__monthArrow', disabled: selected === 0, 'aria-label': '上个月', onClick: () => { setOpenDays(new Set()); setMonthIndex(selected - 1); } }, '‹'),
            h('div', {},
              h('strong', {}, `${year} 年 ${month} 月`),
              h('span', {}, `${recorded} 天有记录`)),
            h('button', { type: 'button', className: 'dsh-sp__monthArrow', disabled: selected === months.length - 1, 'aria-label': '下个月', onClick: () => { setOpenDays(new Set()); setMonthIndex(selected + 1); } }, '›')),
          h('div', { className: 'dsh-sp__calGrid', role: 'grid', 'aria-label': `${year} 年 ${month} 月` },
            WEEK.map(label => h('span', { key: label, className: 'dsh-sp__calDow' }, label)),
            cells.map((day, index) => {
              if (!day) return h('span', { key: `pad-${index}`, className: 'dsh-sp__calBlank', 'aria-hidden': 'true' });
              const date = `${group.month}-${String(day).padStart(2, '0')}`;
              const line = byDate.get(date);
              const future = date > today;
              if (!line) return h('div', { key: date, className: 'dsh-sp__calDay dsh-sp__calDay--empty', role: 'gridcell', 'data-future': future, 'data-today': date === today, 'aria-label': future ? `${date} 未到` : `${date} 无记录` },
                h('small', {}, date === today ? '今天' : day),
                h('em', {}, future ? '未到' : '无记录'));
              const amount = formatUnits(line.sums);
              return h('button', {
                key: date, type: 'button', className: 'dsh-sp__calDay', role: 'gridcell',
                'data-open': openDays.has(date), 'data-today': date === today, 'aria-pressed': openDays.has(date),
                'aria-label': `${date} ${amount}`, onClick: () => toggleOpen(date)
              },
                h('small', {}, date === today ? '今天' : day),
                h('strong', {}, amount),
                h('em', {}, primary ? `${line.providers.size} 个供应商` : `${line.models.length} 条用量`));
            })),
          openedDetail && h('div', { className: 'dsh-sp__calDetail' },
            h('div', { className: 'dsh-sp__calDetailHead' },
              h('strong', {}, `${opened} 的明细`),
              h('span', {}, formatUnits(openedLine.sums))),
            h('div', { className: 'dsh-sp__dayBody' }, openedDetail.body)));
      };
      return h('div', { className: 'dsh-sp__cal' }, renderMonth(group));
    }

    function SpendingPage() {
      const [data, setData] = React.useState(null), [error, setError] = React.useState('');
      const [busy, setBusy] = React.useState(false), [days, setDays] = React.useState(7), [mode, setMode] = React.useState('actual');
      const [editor, setEditor] = React.useState(null), [form, setForm] = React.useState(null), [query, setQuery] = React.useState([]);
      const [openDays, setOpenDays] = React.useState(() => new Set()), [openProviders, setOpenProviders] = React.useState(() => new Set());
      injectStyle();
      const load = React.useCallback(async (signal) => {
        try { const r = await fetch('/api/personal-spending', { signal }); const body = await r.json(); if (!r.ok) throw Error(body.error); setData(body); setError(''); }
        catch (e) { if (e.name !== 'AbortError') setError(e.message || '读取失败'); }
      }, []);
      React.useEffect(() => { const c = new AbortController(); load(c.signal); const id = setInterval(() => load(c.signal), 30000); return () => { c.abort(); clearInterval(id); }; }, [load]);
      React.useEffect(() => { if (!editor) return; const escape = e => { if (e.key === 'Escape') setEditor(null); }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [editor]);
      const exportData = () => {
        let url, anchor;
        try {
          const bytes = spendingExcelBytes(spendingExcelSheets(data));
          url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
          anchor = document.createElement('a'); anchor.href = url; anchor.download = `消费账本-${data.today}.xlsx`;
          document.body.appendChild(anchor); anchor.click();
        } catch (e) { setError(`Excel 导出失败：${e.message || '请稍后重试'}；原账本未修改。`); }
        finally { anchor?.remove(); if (url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
      };
      const post = async body => { const r = await fetch('/api/personal-spending', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const json = await r.json(); if (!r.ok) throw Error(json.error); return json; };
      const save = async () => { try { setBusy(true); await post({ action: 'price', ...form }); setEditor(null); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
      const refresh = async () => { try { setBusy(true); const r = await post({ action: 'refresh' }); setQuery(r.results); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
      const edit = row => { const p = priceOf(data, row); setEditor(row); setForm({ provider: row.provider, model: row.model, key_id: row.key_id, unit: p?.unit || '元', input: p?.input ?? '', output: p?.output ?? '', cache_read: p?.cache_read ?? '', cache_write: p?.cache_write ?? '' }); };
      const toggle = (setter, id) => setter(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
      if (!data) return h('section', { className: 'dsh-spending', style: { padding: '10px 0 48px' } },
        h('div', { className: 'dsh-sp__loading' },
          error ? h('span', { role: 'alert', style: { color: 'var(--dsw-alias-label-error,#d05252)' } }, error)
            : [h('span', { key: 'a', className: 'dsh-sp__spin' }, '↻'), h('span', { key: 'b' }, '正在读取本机消费记录…')]));
      const view = spendingView(data, days, mode);
      const primary = mode === 'actual';
      const unknownPrice = new Set(view.lines.flatMap(line => line.models.filter(row => row.estimate === null && row.missing < row.calls).map(row => `${row.provider}/${row.model}/${row.key_id}`))).size;
      const alerts = [error && { tone: 'bad', text: error }, data.writeError && { tone: 'bad', text: data.writeError }, data.balanceError && { tone: 'warn', text: data.balanceError }].filter(Boolean);
      const meters = new Map();
      for (const line of view.lines) {
        const daySums = new Map();
        line.providers.forEach(p => p.units.forEach((value, unit) => daySums.set(unit, (daySums.get(unit) || 0) + value)));
        for (const [id, p] of line.providers) {
          const providerSum = [...p.units.values()].reduce((sum, value) => sum + value, 0);
          const daySum = [...daySums.values()].reduce((sum, value) => sum + value, 0);
          meters.set(`${line.date}\t${id}`, daySum > 0 ? providerSum / daySum : 0);
        }
      }
      const excluded = data.providers.filter(p => data.preferences.find(x => x.provider === p.id)?.key_id === '__exclude__');
      const active = data.providers.filter(p => !excluded.includes(p));
      // 每一天的合计：余额口径按供应商差额，估算口径只算已定价的用量。
      const lineSums = line => {
        const sums = new Map();
        if (primary) line.providers.forEach(p => p.units.forEach((value, unit) => sums.set(unit, (sums.get(unit) || 0) + value)));
        else line.models.forEach(row => { if (row.estimate !== null) sums.set(row.unit, (sums.get(row.unit) || 0) + row.estimate); });
        return sums;
      };
      const renderDay = (line, index) => renderSpendingDay({ line, sums: lineSums(line), primary, open: openDays.has(line.date), today: data.today, meters, edit, toggleOpen: () => toggle(setOpenDays, line.date) });
      const renderProvider = p => {
        const representative = data.preferences.find(x => x.provider === p.id)?.key_id || p.defaultKey;
        const isExcluded = representative === '__exclude__';
        const keys = p.keys.length ? p.keys : [{ id: p.defaultKey, name: '默认密钥' }];
        const rows = keys.map(item => {
          const result = (data.balanceResults || query).find(x => x.provider === p.id && x.key === item.id);
          const entry = data.ledger[`${p.id}\t${item.id}`];
          const readings = result?.status === 'ok' && result.balances?.length ? result.balances : entry?.last?.readings || [];
          return { ...item, readings, at: result?.updatedAt || entry?.last?.at, stale: Boolean(result && result.status !== 'ok' && readings.length) };
        });
        const latest = rows.map(item => item.at).filter(Boolean).sort().at(-1);
        const dot = isExcluded ? 'muted' : rows.some(item => item.readings.length && !item.stale) ? 'ok' : rows.some(item => item.stale) ? 'bad' : 'muted';
        const open = openProviders.has(p.id);
        return h('div', { key: p.id, className: 'dsh-sp__prov', 'data-excluded': isExcluded },
          h('div', { className: 'dsh-sp__provHead' },
            h('span', { className: 'dsh-sp__dot', 'data-state': dot, title: dot === 'ok' ? '读数正常' : dot === 'bad' ? '更新失败' : '尚无读数' }),
            h('strong', { className: 'dsh-sp__provName', title: p.name }, p.name),
            isExcluded ? h(Chip, { tone: 'muted' }, '不计入合计') : p.enabled === false ? h(Chip, { tone: 'warn' }, '已停用') : null,
            h('button', { type: 'button', className: 'dsh-sp__priceToggle', onClick: () => toggle(setOpenProviders, p.id), 'aria-expanded': open, title: '设置模型单价' }, open ? '收起' : `单价 ${p.models.length}`)),
          open && h('div', { className: 'dsh-sp__pricePanel' },
            p.models.length ? p.models.map(m => {
              const k = modelKey(p, m), configured = priceOf(data, { provider: p.id, model: m.id, key_id: k.id });
              return h('button', { key: m.id, type: 'button', className: 'dsh-sp dsh-sp--ghost dsh-sp--block', style: { justifyContent: 'space-between' }, onClick: () => edit({ provider: p.id, provider_name: p.name, model: m.id, model_name: m.name, key_id: k.id, key_name: k.name }) },
                h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } }, `${m.name} · ${k.name}`),
                h('span', { className: 'dsh-sp__meta' }, configured ? `${money(configured.input)} / ${money(configured.output)} ${unitText(configured.unit)}` : '未定价'));
            }) : h('p', { className: 'dsh-sp__meta' }, '模型产生用量后也可在明细中设置单价。')),
          h('ul', { className: 'dsh-sp__keyList' }, rows.map(item => h('li', { key: item.id, className: 'dsh-sp__keyLine' },
            h('span', { className: 'dsh-sp__keyName', title: item.name }, item.name),
            item.readings.length
              ? h('span', { className: 'dsh-sp__keyValue', title: item.stale ? '本次刷新失败，显示上次读数' : item.at ? `更新于 ${fromAgo(item.at)}` : undefined },
                item.readings.map(reading => `${reading.remaining ?? '—'} ${unitText(reading.unit)}`).join(' / '))
              : h('span', { className: 'dsh-sp__keyMeta' }, item.stale ? '刷新失败' : '未查询')))),
          h('div', { className: 'dsh-sp__metaRow' },
            h('span', { className: 'dsh-sp__meta' }, isExcluded ? '模型用量仍独立记录' : `${rows.length} 把密钥`),
            h('span', { className: 'dsh-sp__meta' }, latest ? `更新于 ${fromAgo(latest)}` : '未更新')));
      };
      // 关键指标卡：今日金额 + 时段合计 + 记录天数，主次分明。
      const todayTotals = new Map();
      const todayLine = view.lines.find(line => line.date === data.today);
      if (todayLine) {
        if (primary) todayLine.providers.forEach(p => p.units.forEach((value, unit) => todayTotals.set(unit, (todayTotals.get(unit) || 0) + value)));
        else todayLine.models.forEach(row => { if (row.estimate !== null) todayTotals.set(row.unit, (todayTotals.get(row.unit) || 0) + row.estimate); });
      }
      const deltaChips = h('div', { className: 'dsh-sp__chips' },
        view.deltas.map(item => h(Chip, {
          key: item.unit,
          tone: item.change > 0 ? 'up' : 'down',
          title: `较上一个有记录的日期${item.ratio === null ? '' : `（${(item.ratio * 100).toFixed(0)}%）`}`
        }, h('em', {}, '较上次'), `${item.change > 0 ? '+' : '−'}${money(Math.abs(item.change))} ${unitText(item.unit)}`)));
      const heroPrimary = h('div', {},
        h('div', { className: 'dsh-sp__kpiLabel' }, primary ? '今天总花费' : '今日模型估算'),
        h(Amount, { units: todayTotals, hint: '今日暂无记录' }),
        view.deltas.length ? deltaChips : null);
      const periodCard = h('div', { className: 'dsh-sp__statSide' },
        h('div', { className: 'dsh-sp__kpiLabel' }, '所选时段合计'),
        h(Amount, { units: primary ? view.totals : view.estimatedTotals, size: 'sm', hint: '暂无记录' }),
        h('div', { className: 'dsh-sp__chips', style: { marginTop: 10 } },
          primary
            ? h(Chip, {}, h('em', {}, '币种'), view.totals.size ? [...view.totals.keys()].map(unitText).join(' · ') : '无')
            : h(Chip, { tone: unknownPrice > 0 ? 'warn' : undefined }, unknownPrice > 0 ? `${unknownPrice} 项未定价` : '全部已定价')));
      const daysCard = h('div', { className: 'dsh-sp__statSide' },
        h('div', { className: 'dsh-sp__kpiLabel' }, '有记录天数'),
        h('div', { className: 'dsh-sp__kpi dsh-sp__kpi--sm' }, view.lines.length),
        h('div', { className: 'dsh-sp__chips', style: { marginTop: 10 } },
          h(Chip, {}, h('em', {}, '自'), view.since),
          h(Chip, {}, h('em', {}, '供应商'), `${active.length} 个计入`)));
      const heroNote = h('p', { className: 'dsh-sp__footNote' }, primary
        ? '按每个供应商选定的一把密钥的余额查询差额计算；相同账户或其他密钥可能重复或遗漏，请核对上游账单。跨日首次查询的差额计入查询当日。'
        : '根据请求返回的 token 数及你填写的每百万 token 单价计算；无单价、缺少用量和未进入 Harness 的消费不计入。修改单价会重新计算历史估算。');
      const hero = h('section', { className: 'dsh-sp__card dsh-sp__hero' },
        h('div', { className: 'dsh-sp__heroGrid' },
          heroPrimary,
          h('div', { className: 'dsh-sp__dividerV' }),
          periodCard,
          h('div', { className: 'dsh-sp__dividerV' }),
          daysCard),
        heroNote);
      // 逐日趋势
      const trendCard = h('section', { className: 'dsh-sp__card' },
        h('div', { className: 'dsh-sp__cardHead' },
          h('div', {},
            h('h2', { className: 'dsh-sp__cardTitle' }, '逐日趋势'),
            h('p', { className: 'dsh-sp__cardSub' }, primary ? '按天汇总余额差额' : '按天汇总模型估算')),
          view.series.length > 0
            ? h('span', { className: 'dsh-sp__cardSub' }, `最近 ${view.lines.length} 天 · 峰值 ${money(Math.max(...view.series.map(entry => entry.max)))}`)
            : null),
        h(TrendChart, { view }));
      // 供应商与统计密钥
      const providerCard = h('section', { className: 'dsh-sp__card' },
        h('div', { className: 'dsh-sp__cardHead' },
          h('div', {},
            h('h2', { className: 'dsh-sp__cardTitle' }, '密钥余额'),
            h('p', { className: 'dsh-sp__cardSub' }, '按供应商列出每一把密钥的最近余额；未查询过的密钥单独标出。')),
          h('span', { className: 'dsh-sp__cardSub' }, `${active.length} 个计入 · ${excluded.length} 个排除`)),
        data.providers.length
          ? h('div', { className: 'dsh-sp__provGrid' }, [...active, ...excluded].map(renderProvider))
          : h('p', { className: 'dsh-sp__empty' }, '尚未添加供应商。'));
      // 每日明细
      const calendar = view.lines.length
        ? h(SpendingCalendar, { lines: view.lines.map(line => ({ ...line, sums: lineSums(line) })), primary, openDays, setOpenDays, today: data.today, meters, edit, toggleOpen: date => setOpenDays(current => new Set(current.has(date) ? [] : [date])) })
        : h('p', { className: 'dsh-sp__empty', style: { margin: '0 18px 18px' } }, '所选时间段还没有记录；刷新已配置的余额，或在模型产生用量后查看。');
      const detailCard = h('section', { className: 'dsh-sp__card dsh-sp__card--flush' },
        h('div', { className: 'dsh-sp__cardHead dsh-sp__cardHead--inset' },
          h('div', {},
            h('h2', { className: 'dsh-sp__cardTitle' }, '每日明细'),
            h('p', { className: 'dsh-sp__cardSub' }, primary ? '按月查看，点某一天展开各供应商差额' : '按月查看，点某一天展开模型用量与估算')),
          openDays.size
            ? h('button', { type: 'button', className: 'dsh-sp dsh-sp--quiet dsh-sp--sm', onClick: () => setOpenDays(new Set()) }, '收起明细')
            : null),
        calendar);
      return h('section', { className: 'dsh-spending' },
        h('header', { className: 'dsh-sp__top' },
          h('div', {},
            h('p', { className: 'dsh-sp__eyebrow' }, 'Personal Ledger'),
            h('h1', { className: 'dsh-sp__title' }, '消费总览'),
            h('p', { className: 'dsh-sp__lede' }, `本机长期记录 · 自 ${new Date(data.startedAt).toLocaleDateString('zh-CN')} 起记账 · 运行时每 5 分钟采样余额`)),
          h('div', { className: 'dsh-sp__topActions' },
            h('button', { type: 'button', className: 'dsh-sp dsh-sp--ghost dsh-sp--export', onClick: exportData, title: '导出全部已加载账本为 Excel：每日汇总、余额明细、模型用量、余额读数、单价与统计设置' }, h('span', { 'aria-hidden': true }, '↓'), '导出 Excel'),
            h('button', { type: 'button', className: 'dsh-sp dsh-sp--primary', onClick: refresh, disabled: busy, title: '查询各供应商选定密钥的余额并更新消费记录' },
              h('span', { className: 'dsh-sp__spin', style: { animationPlayState: busy ? 'running' : 'paused' } }, '↻'),
              busy ? '刷新中…' : '刷新余额'))),
        alerts.length
          ? h('div', { className: 'dsh-sp__alerts' }, alerts.map((item, index) => h('div', { key: index, className: 'dsh-sp__alert', role: 'alert' }, h('span', {}, item.text))))
          : null,
        h('div', { className: 'dsh-sp__toolbar' },
          h('div', { className: 'dsh-sp__seg', role: 'group', 'aria-label': '统计口径' },
            [['actual', '余额变化'], ['estimate', '模型估算'], ['keys', '密钥余额']].map(([value, label]) =>
              h('button', { key: value, type: 'button', 'aria-pressed': mode === value, onClick: () => setMode(value) }, label))),
          mode === 'keys' ? null : h('span', { className: 'dsh-sp__spacer' }),
          mode === 'keys' ? null : h('span', { className: 'dsh-sp__toolLabel' }, '时间范围'),
          mode === 'keys' ? null : h('div', { className: 'dsh-sp__seg', role: 'group', 'aria-label': '时间范围' },
            [[1, '当天'], [7, '7 天'], [30, '30 天'], [36500, '全部']].map(([value, label]) =>
              h('button', { key: value, type: 'button', 'aria-pressed': days === value, onClick: () => setDays(value) }, label)))),
        mode === 'keys' ? providerCard : hero,
        mode === 'keys' ? null : trendCard,
        mode === 'keys' ? null : detailCard,
        editor
          ? h(PriceDialog, { editor, form, setForm, error, busy, onClose: () => setEditor(null), onSave: save })
          : null);
    }
    return {
    inject: ['slots'],
    apply(ctx) {
      ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
        name: 'plugins.row.config',
        key: '@local/dsh-personal-customizations#personal-spending'
      }, ({ view }) => view === 'page' ? h(SpendingPage) : null));
      // 挂到服务运行状态页的页签栏；插槽由智力检测页声明，检测组件关闭时这里不会注册。
      ctx.slots.inject('intelligence.status.tab', () => ctx.slots.register({
        name: 'intelligence.status.tab',
        id: 'spending',
        order: 10,
        label: '余额总览'
      }, () => h(SpendingPage)));
    }
  }; }
});
