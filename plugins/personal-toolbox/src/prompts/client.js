window.__ModuleLoader__.load({
	id: "@local/dsh-client-ui-prompt-presets",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");

		const STORAGE_KEY = "dsh.local.promptPresets.v1";
		const MAX_PRESETS = 40;
		const MAX_TITLE = 40;
		const MAX_BODY = 4000;

		const css = [
			".dshPp_root{position:relative;display:inline-flex;align-items:center}",
			".dshPp_trigger{box-sizing:border-box;cursor:pointer;height:28px;padding:0 8px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;display:inline-flex;align-items:center;gap:4px}",
			".dshPp_trigger:hover,.dshPp_trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshPp_trigger:disabled{opacity:.45;cursor:default}",
			".dshPp_panel{z-index:1100;box-sizing:border-box;width:320px;max-width:calc(100vw - 24px);max-height:min(420px,calc(100vh - 24px));overflow:auto;padding:10px;border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);position:fixed}",
			".dshPp_head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}",
			".dshPp_title{font-size:13px;font-weight:600;line-height:20px}",
			".dshPp_add{cursor:pointer;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);height:26px;padding:0 8px;font:inherit;font-size:12px}",
			".dshPp_add:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshPp_empty{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;padding:8px 4px}",
			".dshPp_list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}",
			".dshPp_row{display:flex;align-items:stretch;gap:4px}",
			".dshPp_pick{flex:1;min-width:0;cursor:pointer;text-align:left;border:none;border-radius:8px;background:transparent;color:inherit;padding:6px 8px}",
			".dshPp_pick:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dshPp_name{display:block;font-size:13px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dshPp_preview{display:block;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dshPp_icon{flex:none;width:26px;height:26px;margin-top:4px;cursor:pointer;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary)}",
			".dshPp_icon:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dshPp_form{display:flex;flex-direction:column;gap:8px}",
			".dshPp_label{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".dshPp_input,.dshPp_textarea{box-sizing:border-box;width:100%;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:6px 8px;font:inherit;font-size:13px}",
			".dshPp_input:focus,.dshPp_textarea:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
			".dshPp_textarea{min-height:110px;resize:vertical}",
			".dshPp_actions{display:flex;justify-content:flex-end;gap:8px}",
			".dshPp_ghost,.dshPp_primary{cursor:pointer;height:28px;border-radius:8px;padding:0 10px;font:inherit;font-size:13px}",
			".dshPp_ghost{border:.5px solid var(--dsw-alias-border-l4);background:transparent;color:var(--dsw-alias-label-secondary)}",
			".dshPp_primary{border:none;background:var(--dsw-alias-state-business-primary);color:#fff}",
			".dshPp_primary:disabled{opacity:.45;cursor:default}"
		].join("");

		const tagId = "@local/dsh-client-ui-prompt-presets/prompt-presets.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-client-ui-prompt-presets";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		function readPresets() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return [];
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				return parsed.flatMap((item, index) => {
					if (!item || typeof item !== "object") return [];
					const title = String(item.title ?? "").trim().slice(0, MAX_TITLE);
					const body = String(item.body ?? "").trim().slice(0, MAX_BODY);
					if (!title || !body) return [];
					return [{
						id: String(item.id ?? `preset-${index}`),
						title,
						body
					}];
				}).slice(0, MAX_PRESETS);
			} catch {
				return [];
			}
		}

		function writePresets(items) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_PRESETS)));
		}

		function newId() {
			return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
		}

		const zh = {
			"trigger": "常用",
			"trigger.aria": "常用提示词",
			"title": "常用提示词",
			"add": "新增",
			"empty": "还没有常用语。点「新增」写一条，只会保存在这台电脑的浏览器里。",
			"edit": "编辑",
			"remove": "删除",
			"field.title": "名称",
			"field.body": "内容",
			"cancel": "取消",
			"save": "保存",
			"title.placeholder": "例如：查 bug",
			"body.placeholder": "点一下就会填进输入框的完整提示词"
		};
		const en = {
			"trigger": "Presets",
			"trigger.aria": "Prompt presets",
			"title": "Prompt presets",
			"add": "Add",
			"empty": "No presets yet. Add one — it stays in this browser only.",
			"edit": "Edit",
			"remove": "Delete",
			"field.title": "Name",
			"field.body": "Prompt",
			"cancel": "Cancel",
			"save": "Save",
			"title.placeholder": "e.g. Debug",
			"body.placeholder": "The full prompt inserted into the composer"
		};

		const MEASURE_STYLE = {
			visibility: "hidden",
			position: "fixed",
			left: 0,
			top: 0
		};

		class PromptPresetGuard extends react.Component {
			constructor(props) {
				super(props);
				this.state = { failed: false };
			}
			static getDerivedStateFromError() {
				return { failed: true };
			}
			componentDidCatch() {}
			render() {
				if (this.state.failed) return null;
				return this.props.children;
			}
		}

		function PromptPresetControl({ locked, inputActions, t }) {
			const [open, setOpen] = react.useState(false);
			const [items, setItems] = react.useState(readPresets);
			const [mode, setMode] = react.useState("list");
			const [editingId, setEditingId] = react.useState(null);
			const [title, setTitle] = react.useState("");
			const [body, setBody] = react.useState("");
			const rootRef = react.useRef(null);
			const panelRef = react.useRef(null);
			const triggerRef = react.useRef(null);
			const [panelPos, setPanelPos] = react.useState(null);

			const persist = (next) => {
				writePresets(next);
				setItems(next);
			};
			const close = () => {
				setOpen(false);
				setMode("list");
				setEditingId(null);
			};
			const beginCreate = () => {
				setMode("edit");
				setEditingId(null);
				setTitle("");
				setBody("");
			};
			const beginEdit = (item) => {
				setMode("edit");
				setEditingId(item.id);
				setTitle(item.title);
				setBody(item.body);
			};
			const save = () => {
				const nextTitle = title.trim().slice(0, MAX_TITLE);
				const nextBody = body.trim().slice(0, MAX_BODY);
				if (!nextTitle || !nextBody) return;
				if (editingId) persist(items.map((item) => item.id === editingId ? { ...item, title: nextTitle, body: nextBody } : item));
				else persist([...items, { id: newId(), title: nextTitle, body: nextBody }].slice(0, MAX_PRESETS));
				setMode("list");
				setEditingId(null);
			};
			const remove = (id) => {
				persist(items.filter((item) => item.id !== id));
				if (editingId === id) setMode("list");
			};
			const applyPreset = (item) => {
				if (!inputActions) return;
				inputActions.setDraft(item.body);
				close();
			};

			react.useEffect(() => {
				if (!open) return;
				const onDown = (event) => {
					if (rootRef.current?.contains(event.target) === true) return;
					if (panelRef.current?.contains(event.target) === true) return;
					close();
				};
				const onKey = (event) => {
					if (event.key === "Escape") close();
				};
				document.addEventListener("mousedown", onDown);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onDown);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);

			react.useLayoutEffect(() => {
				if (!open) {
					setPanelPos(null);
					return;
				}
				const place = () => {
					const rect = triggerRef.current?.getBoundingClientRect();
					if (!rect) return;
					const width = panelRef.current?.offsetWidth || 320;
					const height = panelRef.current?.offsetHeight || 240;
					const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
					let top = rect.top - 8 - height;
					if (top < 12) top = Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - height - 12));
					setPanelPos({
						position: "fixed",
						left,
						top,
						visibility: "visible"
					});
				};
				place();
				window.addEventListener("resize", place);
				return () => window.removeEventListener("resize", place);
			}, [open, mode, items.length]);

			return react_jsx_runtime.jsxs("div", {
				ref: rootRef,
				className: "dshPp_root",
				children: [
					react_jsx_runtime.jsx("button", {
						ref: triggerRef,
						type: "button",
						className: "dshPp_trigger",
						"aria-label": t("trigger.aria"),
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						disabled: locked,
						onMouseDown: (event) => event.preventDefault(),
						onClick: (event) => {
							event.stopPropagation();
							if (open) close();
							else setOpen(true);
						},
						children: t("trigger")
					}),
					open && react_dom.createPortal(react_jsx_runtime.jsxs("div", {
						ref: panelRef,
						className: "dshPp_panel",
						style: panelPos ?? MEASURE_STYLE,
						role: "dialog",
						"aria-label": t("title"),
						children: [
							react_jsx_runtime.jsxs("div", {
								className: "dshPp_head",
								children: [
									react_jsx_runtime.jsx("div", { className: "dshPp_title", children: t("title") }),
									mode === "list" && react_jsx_runtime.jsx("button", {
										type: "button",
										className: "dshPp_add",
										onClick: beginCreate,
										children: t("add")
									})
								]
							}),
							mode === "list" && (items.length === 0
								? react_jsx_runtime.jsx("div", { className: "dshPp_empty", children: t("empty") })
								: react_jsx_runtime.jsx("ul", {
									className: "dshPp_list",
									children: items.map((item) => react_jsx_runtime.jsxs("li", {
										className: "dshPp_row",
										children: [
											react_jsx_runtime.jsxs("button", {
												type: "button",
												className: "dshPp_pick",
												onClick: () => applyPreset(item),
												children: [
													react_jsx_runtime.jsx("span", { className: "dshPp_name", children: item.title }),
													react_jsx_runtime.jsx("span", { className: "dshPp_preview", children: item.body })
												]
											}),
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dshPp_icon",
												title: t("edit"),
												"aria-label": t("edit"),
												onClick: () => beginEdit(item),
												children: "✎"
											}),
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dshPp_icon",
												title: t("remove"),
												"aria-label": t("remove"),
												onClick: () => remove(item.id),
												children: "×"
											})
										]
									}, item.id))
								})),
							mode === "edit" && react_jsx_runtime.jsxs("div", {
								className: "dshPp_form",
								children: [
									react_jsx_runtime.jsx("label", { className: "dshPp_label", children: t("field.title") }),
									react_jsx_runtime.jsx("input", {
										className: "dshPp_input",
										value: title,
										maxLength: MAX_TITLE,
										placeholder: t("title.placeholder"),
										onChange: (event) => setTitle(event.target.value)
									}),
									react_jsx_runtime.jsx("label", { className: "dshPp_label", children: t("field.body") }),
									react_jsx_runtime.jsx("textarea", {
										className: "dshPp_textarea",
										value: body,
										maxLength: MAX_BODY,
										placeholder: t("body.placeholder"),
										onChange: (event) => setBody(event.target.value)
									}),
									react_jsx_runtime.jsxs("div", {
										className: "dshPp_actions",
										children: [
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dshPp_ghost",
												onClick: () => setMode("list"),
												children: t("cancel")
											}),
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: "dshPp_primary",
												disabled: !title.trim() || !body.trim(),
												onClick: save,
												children: t("save")
											})
										]
									})
								]
							})
						]
					}), document.body)
				]
			});
		}

		const NS = "promptPreset";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-prompt-presets: dictionaries");
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "prompt-presets",
				order: 10,
				label: "常用",
				locale: NS
			}, function PromptPresetSeat(props) {
				const translate = typeof props.t === "function" ? props.t : (key) => zh[key] || key;
				return react_jsx_runtime.jsx(PromptPresetGuard, {
					children: react_jsx_runtime.jsx(PromptPresetControl, {
						locked: props.locked === true,
						inputActions: props.inputActions,
						t: translate
					})
				});
			}));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
