window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-model-selection",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		/*COMPAT_PREFERENCES*/
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region ../../util/values/src/index.ts
		/**
		* Weak-key lookup with a strongly retained iterable set of associated values.
		*
		* Each value must belong to only one key. The container performs no automatic
		* cleanup; owners delete associations or clear the container at lifecycle end.
		*/
		var WeakMapWithValues = class {
			keys = /* @__PURE__ */ new WeakMap();
			valueSet = /* @__PURE__ */ new Set();
			/** Live strongly retained values in insertion order. */
			values = this.valueSet;
			/**
			* Read the value associated with a key.
			* @param key - weakly held lookup key.
			* @returns the associated value, or absence.
			*/
			get(key) {
				return this.keys.get(key);
			}
			/**
			* Test whether a key has an association.
			* @param key - weakly held lookup key.
			* @returns whether the key is present.
			*/
			has(key) {
				return this.keys.has(key);
			}
			/**
			* Associate one key with one caller-unique value.
			* @param key - weakly held lookup key.
			* @param value - strongly retained value that belongs to no other key.
			* @returns this container.
			*/
			set(key, value) {
				if (this.keys.has(key)) {
					const previous = this.keys.get(key);
					if (previous === value) return this;
					this.valueSet.delete(previous);
				}
				this.keys.set(key, value);
				this.valueSet.add(value);
				return this;
			}
			/**
			* Remove one association and its strongly retained value.
			* @param key - weakly held lookup key.
			* @returns whether an association was removed.
			*/
			delete(key) {
				if (!this.keys.has(key)) return false;
				const value = this.keys.get(key);
				const deleted = this.keys.delete(key);
				this.valueSet.delete(value);
				return deleted;
			}
			/** Remove every association and strongly retained value. */
			clear() {
				this.keys = /* @__PURE__ */ new WeakMap();
				this.valueSet.clear();
			}
		};
		//#endregion
		//#region lib/types/client/catalog.js
		/** One Host-generation model catalog shared by every Session selector. */
		/** Loads at most one model catalog for the current Host generation. */
		var ModelCatalogDirectory = class {
			ctx;
			/** Current shared catalog value and load lifecycle. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				value: null,
				status: "idle",
				error: null
			});
			reasoning = /* @__PURE__ */ new Map();
			/**
			* Read the last advertised reasoning metadata, including unavailable models.
			* @param selection - provider and model whose effort is displayed.
			* @returns reasoning metadata observed during this Host generation.
			*/
			reasoningFor(selection) {
				return this.reasoning.get(JSON.stringify([selection.provider, selection.model]));
			}
			generation = 0;
			inflight;
			/**
			* @param ctx - the providing plugin's context, whose `remote.session`
			* namespace carries the Host-generation catalog.
			*/
			constructor(ctx) {
				this.ctx = ctx;
			}
			/**
			* Return the current generation's catalog, sharing its one in-flight load.
			* @returns the loaded global catalog.
			*/
			load() {
				const state = this.store.getSnapshot();
				if (state.status === "ready" && state.value !== null) return Promise.resolve(state.value);
				if (this.inflight !== void 0) return this.inflight;
				const generation = this.generation;
				this.store.update((draft) => {
					draft.status = "loading";
					draft.error = null;
				});
				const operation = this.ctx.remote.session.modelCatalog().then((response) => {
					if (!response.ok) throw new Error(`${response.error.code}: ${response.error.message}`);
					if (generation === this.generation) {
						for (const group of response.value.groups) for (const model of group.models) this.reasoning.set(JSON.stringify([group.id, model.id]), model.reasoning);
						this.store.set({
							value: response.value,
							status: "ready",
							error: null
						});
					}
					return response.value;
				}).catch((error) => {
					if (generation === this.generation) this.store.update((draft) => {
						draft.status = "error";
						draft.error = error instanceof Error ? error.message : String(error);
					});
					throw error;
				}).finally(() => {
					if (generation === this.generation && this.inflight === operation) this.inflight = void 0;
				});
				this.inflight = operation;
				return operation;
			}
			/**
			* Invalidate the loaded catalog; the next explicit menu read reloads it.
			* @param clear - whether values from the previous Host generation must be hidden.
			*/
			invalidate(clear = false) {
				this.generation += 1;
				this.inflight = void 0;
				const value = clear ? null : this.store.getSnapshot().value;
				this.store.set({
					value,
					status: "idle",
					error: null
				});
			}
			/** Invalidate and reload the catalog after a Host-side model input changes. */
			refresh() {
				this.invalidate();
				this.load().catch(() => {});
			}
			/** Clear Host-specific values and load the replacement Host generation. */
			resetGeneration() {
				this.reasoning.clear();
				this.invalidate(true);
				this.load().catch(() => {});
			}
		};
		//#endregion
		//#region lib/types/client/directory.js
		/** One session's shared directory controller; disposed with the session scope. */
		var ModelDirectory = class {
			sessions;
			sessionId;
			available;
			catalog;
			projected;
			isBlank;
			track;
			/** The shared snapshot both entries render from (uSES-safe store). */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				current: null,
				routable: null,
				groups: [],
				failures: [],
				status: "idle",
				pending: null,
				error: null
			});
			/** Latest selection operation wins; an older response never overwrites a newer one. */
			generation = 0;
			disposed = false;
			unsubscribeCatalog;
			unsubscribeSelection;
			/**
			* @param sessions - the session wire face (captured from the plugin's root connection).
			* @param sessionId - the owning session.
			* @param available - whether this session may use Agent-bound model RPCs.
			* @param catalog - Host-generation catalog shared by every Session.
			* @param projected - durable model selection projected from Session history.
			* @param isBlank - whether this Session has no first message yet.
			* @param track - desktop-only callback after a successful user selection.
			*/
			constructor(sessions, sessionId, available, catalog, projected, isBlank, track) {
				this.sessions = sessions;
				this.sessionId = sessionId;
				this.available = available;
				this.catalog = catalog;
				this.projected = projected;
				this.isBlank = isBlank;
				this.track = track;
				this.unsubscribeCatalog = catalog.store.subscribe(() => {
					this.syncInputs();
				});
				this.unsubscribeSelection = projected.subscribe(() => {
					this.syncInputs();
				});
				this.syncInputs();
			}
			/**
			* Ensure the Host generation's shared available catalog is loaded.
			* @returns the fresh directory value.
			*/
			async load() {
				this.assertAvailable();
				await this.catalog.load();
				this.syncInputs();
				return this.store.getSnapshot();
			}
			/**
			* Select the complete provider/model/reasoning selection. The durable
			* projection frame updates the shared current; failures surface on the store
			* and return with the operation so each entry can present its own failure.
			* @param selection - provider, provider-owned model id, and optional adapter-owned effort.
			* @returns the selection outcome, including the original Remote failure.
			*/
			async select(selection) {
				this.assertAvailable();
				const previous = this.store.getSnapshot().current;
				const previousEffort = previous?.reasoningEffort ?? (previous === null ? void 0 : this.catalog.reasoningFor(previous)?.defaultEffort);
				const nextEffort = selection.reasoningEffort ?? this.catalog.reasoningFor(selection)?.defaultEffort;
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "selecting";
					s.pending = selection;
					s.error = null;
				});
				const result = await this.sessions.selectModel({
					sessionId: this.sessionId,
					provider: selection.provider,
					model: selection.model,
					...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
				});
				if (this.disposed || generation !== this.generation) return result.ok ? {
					ok: true,
					value: void 0
				} : result;
				if (!result.ok) {
					this.store.update((s) => {
						s.status = "error";
						s.pending = null;
						s.error = `${result.error.code}: ${result.error.message}`;
					});
					return result;
				}
				if (previous !== null) {
					const from = `${previous.provider}/${previous.model}`;
					const to = `${selection.provider}/${selection.model}`;
					if (from !== to) this.track?.("model_switch", {
						...this.isBlank() ? {} : { session_id: this.sessionId },
						switch_from: from,
						switch_to: to
					});
					if (from === to && previousEffort !== nextEffort) this.track?.("thinking_level_switch", {
						...this.isBlank() ? {} : { session_id: this.sessionId },
						model_name: to,
						switch_from: previousEffort ?? "default",
						switch_to: nextEffort ?? "default"
					});
				}
				this.store.update((s) => {
					s.status = "ready";
					s.pending = null;
					s.error = null;
				});
				this.syncInputs();
				return {
					ok: true,
					value: void 0
				};
			}
			/**
			* Invalidate an in-flight selection response from the previous Host generation.
			*/
			resetConnected() {
				if (this.disposed) return;
				++this.generation;
				this.store.update((state) => {
					if (state.status === "selecting") state.status = "idle";
					state.pending = null;
					state.error = null;
				});
				this.syncInputs();
			}
			/** Scope teardown: late settlements lose write access to the store. */
			dispose() {
				this.disposed = true;
				this.unsubscribeSelection();
				this.unsubscribeCatalog();
			}
			assertAvailable() {
				if (!this.available()) throw new Error("model selection is unavailable for addressed subagent sessions");
			}
			syncInputs() {
				if (this.disposed) return;
				const catalog = this.catalog.store.getSnapshot();
				const projected = modelSelectionProjection(this.projected.getSnapshot());
				const intended = projected?.next ?? catalog.value?.default;
				const reasoning = intended === void 0 ? void 0 : this.catalog.reasoningFor(intended);
				const effort = intended?.reasoningEffort ?? reasoning?.defaultEffort;
				const retainedEffort = effort === void 0 ? void 0 : reasoning?.efforts.find((level) => level.id === effort)?.name ?? effort;
				if (catalog.status !== "ready" || catalog.value === null || projected === void 0) {
					this.store.set({
						current: catalog.value === null ? null : this.store.getSnapshot().current,
						...retainedEffort === void 0 ? {} : { retainedEffort },
						routable: null,
						groups: catalog.value?.groups ?? [],
						failures: catalog.value?.failures ?? [],
						status: catalog.status === "error" ? "error" : "loading",
						pending: this.store.getSnapshot().pending,
						error: catalog.error
					});
					return;
				}
				const selection = projected.next ?? catalog.value.default;
				const routable = catalog.value.groups.some((group) => group.id === selection.provider && group.models.some((model) => model.id === selection.model));
				this.store.set({
					current: selection,
					...retainedEffort === void 0 ? {} : { retainedEffort },
					routable,
					groups: catalog.value.groups,
					failures: catalog.value.failures,
					status: this.store.getSnapshot().status === "selecting" ? "selecting" : "ready",
					pending: this.store.getSnapshot().pending,
					error: null
				});
			}
		};
		function modelSelectionProjection(value) {
			return value === void 0 ? void 0 : value;
		}
		//#endregion
		//#region lib/types/client/service.js
		/** The `ctx.modelDirectories` session model-selection service. */
		var ModelDirectoryResolver = class extends _deepseek_ai_cordis.Service {
			static inject = [
				"sessions",
				"remote",
				"remote.session"
			];
			live = { directories: new WeakMapWithValues() };
			catalog;
			/**
			* @param ctx - owning root context (the service registers itself as `models`).
			*/
			constructor(ctx) {
				super(ctx, "modelDirectories");
				this.catalog = new ModelCatalogDirectory(ctx);
				this.catalog.load().catch(() => {});
				ctx.on("connection/reset", () => {
					this.catalog.resetGeneration();
					for (const directory of this.live.directories.values) directory.resetConnected();
				});
				ctx.remote.$on("llm/adapters-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("settings/document-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("credentials/record-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("credentials/reference-updated", () => {
					this.catalog.refresh();
				});
			}
			/**
			* Resolve the per-session shared directory (lazy; the scope disposer
			* removes and disposes it). Unknown sessions fail loud.
			* @param sessionId - the owning session.
			* @returns the resident directory both entries share.
			*/
			directoryFor(sessionId) {
				const { live } = this;
				const sessions = this.ctx.sessions;
				const actx = sessions.scope(sessionId);
				if (actx === void 0) throw new Error(`ui-model-selection: session "${String(sessionId)}" resolved no scope`);
				const binding = sessions.binding(sessionId);
				if (binding === void 0) throw new Error(`ui-model-selection: session "${String(sessionId)}" resolved no binding`);
				const existing = live.directories.get(binding);
				if (existing !== void 0) return existing;
				const directory = new ModelDirectory(this.ctx.remote.session, sessionId, () => sessions.subagentAddress(sessionId) === void 0, this.catalog, binding.session.projections.faceOf("modelSelection"), () => binding.session.getSnapshot().blank, (name, attributes) => this.ctx.get("productAnalytics")?.track(name, attributes));
				live.directories.set(binding, directory);
				actx.effect(() => () => {
					directory.dispose();
					live.directories.delete(binding);
				}, "ui-model-selection: session directory");
				return directory;
			}
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-model-selection/src/client/ModelSelect.module.css.mjs
		const cssSlider = "._7KE1Ra_menu:has(._7KE1Ra_effortPane){width:max-content;min-width:0;max-width:min(300px,calc(100vw - 32px));padding:0;border-radius:24px}._7KE1Ra_effortPane{width:248px;padding:14px 18px 18px;display:flex;flex-direction:column;gap:16px}._7KE1Ra_effortHead{display:grid;grid-template-columns:28px 1fr 28px;align-items:start;gap:4px}._7KE1Ra_effortHeadSpacer{width:28px;height:28px}._7KE1Ra_effortTitle{display:flex;flex-direction:column;align-items:center;gap:0;min-width:0;padding:0;border:none;border-radius:10px;background:transparent;cursor:pointer;font:inherit;text-align:center;color:inherit}._7KE1Ra_effortTitle:hover{opacity:.86}._7KE1Ra_effortTitleName{display:inline-flex;align-items:center;gap:2px;color:#4c8dff;font-size:15px;font-weight:600;line-height:22px}._7KE1Ra_effortTitleName svg{width:12px;height:12px;flex:none}._7KE1Ra_effortReload{flex:none;width:28px;height:28px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}._7KE1Ra_effortReload:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7KE1Ra_effortReload[data-busy=true] svg{animation:_7KE1Ra_spin .8s linear infinite}._7KE1Ra_effortModel{color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:400;line-height:18px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._7KE1Ra_effortTrack{position:relative;height:28px;touch-action:none;user-select:none;cursor:pointer;outline:none}._7KE1Ra_effortRail{position:absolute;left:0;right:0;top:50%;height:14px;margin-top:-7px;border-radius:999px;overflow:hidden;background:color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent)}._7KE1Ra_effortFill{position:absolute;left:0;top:0;bottom:0;border:0;border-radius:0;background:#4c8dff;width:calc(11px + (100% - 22px) * var(--dsh-effort-fill,0) / 100)}._7KE1Ra_effortThumb{position:absolute;top:50%;width:22px;height:22px;margin-top:-11px;margin-left:-11px;left:calc(11px + (100% - 22px) * var(--dsh-effort-fill,0) / 100);border-radius:50%;background:#fff;box-shadow:0 1px 3px rgb(0 0 0 / 20%);pointer-events:none;z-index:2}._7KE1Ra_effortDots{pointer-events:none;position:absolute;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 11px}._7KE1Ra_effortDot{width:4px;height:4px;border-radius:50%;background:color-mix(in srgb,var(--dsw-alias-label-primary) 28%,transparent);flex:none}._7KE1Ra_effortDot[data-on=true]{background:rgb(255 255 255 / 55%)}@keyframes _7KE1Ra_spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){._7KE1Ra_effortReload[data-busy=true] svg{animation:none}}";
		const css = "._7KE1Ra_root{min-width:0;position:relative}._7KE1Ra_trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}._7KE1Ra_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}._7KE1Ra_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}._7KE1Ra_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}._7KE1Ra_triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}._7KE1Ra_triggerIcon{flex:none;display:none}@container (width<=360px){._7KE1Ra_triggerIcon{display:block}._7KE1Ra_triggerLabel,._7KE1Ra_triggerEffort{display:none}}._7KE1Ra_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}._7KE1Ra_chevronOpen{transform:rotate(180deg)}._7KE1Ra_menu{z-index:1100;background:var(--dsw-specific-menu);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:20px;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}._7KE1Ra_status,._7KE1Ra_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}._7KE1Ra_error,._7KE1Ra_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}._7KE1Ra_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}._7KE1Ra_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}._7KE1Ra_groups{min-height:0;overflow-y:auto}._7KE1Ra_group+._7KE1Ra_group{margin-top:8px;padding-top:6px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent)}._7KE1Ra_groupTitle{z-index:1;background:var(--dsw-specific-menu);color:var(--dsw-alias-brand-primary,#4c8dff);padding:8px 10px 6px;font-size:11px;font-weight:700;letter-spacing:.08em;line-height:16px;text-transform:uppercase;position:sticky;top:0}._7KE1Ra_group ._7KE1Ra_option{padding-left:14px}._7KE1Ra_option{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}._7KE1Ra_option:hover:not(:disabled),._7KE1Ra_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_selected{background:0 0}._7KE1Ra_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}._7KE1Ra_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}._7KE1Ra_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}._7KE1Ra_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}._7KE1Ra_cell{box-sizing:border-box;width:auto;min-width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}._7KE1Ra_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_cellLabel{white-space:nowrap;flex:none}._7KE1Ra_cellValue{text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0;color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}._7KE1Ra_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}";
		// Explicit round corners override the shell's inherited superellipse corner-shape.
		// Geometry follows the reference: 270px card, 238x28px pill, 32px circular thumb.
		const cssEffortGeometry = `
._7KE1Ra_menu:has(._7KE1Ra_effortPane){border-radius:20px;corner-shape:round}
._7KE1Ra_effortPane{box-sizing:border-box;width:270px;max-width:calc(100vw - 32px);padding:12px 16px;gap:16px}
._7KE1Ra_effortTitleName{color:#329bff}
._7KE1Ra_effortTrack{--effort-inset:16px;--effort-position:calc(var(--effort-inset) + (100% - 2 * var(--effort-inset)) * var(--dsh-effort-fill,0) / 100);height:32px;isolation:isolate}
._7KE1Ra_effortTrack:focus-visible{outline:2px solid #329bff;outline-offset:4px;border-radius:999px;corner-shape:round}
._7KE1Ra_effortRail{height:28px;margin-top:-14px;border-radius:999px;corner-shape:round;background:color-mix(in srgb,var(--dsw-alias-label-primary) 12%,var(--dsw-specific-menu));box-shadow:inset 0 0 0 1px rgb(128 128 128 / 8%)}
._7KE1Ra_effortFill{width:var(--effort-position);background:#329bff;border-radius:0;corner-shape:round}
._7KE1Ra_effortThumb{box-sizing:border-box;left:var(--effort-position);width:32px;height:32px;margin-top:-16px;margin-left:-16px;border:1px solid rgb(0 0 0 / 8%);border-radius:50%;corner-shape:round;background:#fff;box-shadow:0 1px 3px rgb(0 0 0 / 16%)}
._7KE1Ra_effortDots{padding:0 var(--effort-inset)}
._7KE1Ra_effortDot{width:5px;height:5px;border-radius:50%;corner-shape:round;background:color-mix(in srgb,var(--dsw-alias-label-primary) 28%,transparent)}
._7KE1Ra_effortDot[data-on=true]{background:rgb(255 255 255 / 40%)}
`;
		// Decorative highest-effort state only: no changes to effort IDs or request mapping.
		const cssEffortMax = `
._7KE1Ra_effortTitleName{transition:color .3s ease}
._7KE1Ra_effortFill::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,#287fff 0%,#5350ff 30%,#b66cff 56%,#813dff 78%,#4e52ff 100%);background-size:180% 100%;opacity:0;transition:opacity .35s ease}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortTitleName{color:#a466ff}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortFill::before{opacity:1;animation:_7KE1Ra_nebula 6s ease-in-out infinite alternate}
._7KE1Ra_effortDots{transition:opacity .25s ease}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortDots{opacity:0}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortRail::before,._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortRail::after{content:"";position:absolute;inset:-6px -24px;pointer-events:none;z-index:1;background-repeat:no-repeat;will-change:transform,opacity;animation:_7KE1Ra_stardrift 4.8s ease-in-out infinite alternate}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortRail::before{background-image:radial-gradient(circle at 9% 65%,#fff9 0 1px,transparent 2px),radial-gradient(circle at 18% 28%,#fff8 0 1px,transparent 2px),radial-gradient(circle at 28% 70%,#fffb 0 1px,transparent 2px),radial-gradient(circle at 40% 40%,#fff9 0 1.2px,transparent 2.2px),radial-gradient(circle at 48% 58%,#fffd 0 1.2px,transparent 2.3px),radial-gradient(circle at 59% 25%,#fffb 0 1px,transparent 2px),radial-gradient(circle at 70% 65%,#fffa 0 1.3px,transparent 2.3px),radial-gradient(circle at 81% 36%,#fffc 0 1px,transparent 2px),radial-gradient(circle at 91% 55%,#fff9 0 1px,transparent 2px)}
._7KE1Ra_effortPane[data-max=true] ._7KE1Ra_effortRail::after{background-image:radial-gradient(circle at 13% 42%,#fff8 0 .7px,transparent 1.8px),radial-gradient(circle at 25% 55%,#fff9 0 .8px,transparent 1.8px),radial-gradient(circle at 34% 25%,#fff8 0 .8px,transparent 1.8px),radial-gradient(circle at 45% 72%,#fffb 0 1px,transparent 2px),radial-gradient(circle at 53% 36%,#fffd 0 1px,transparent 2px),radial-gradient(circle at 63% 58%,#fff9 0 .8px,transparent 1.8px),radial-gradient(circle at 77% 25%,#fff9 0 .8px,transparent 1.8px),radial-gradient(circle at 87% 70%,#fffa 0 .8px,transparent 1.8px);animation-duration:3.6s;animation-delay:-1.7s;animation-direction:alternate-reverse}
@keyframes _7KE1Ra_nebula{from{background-position:0% 50%}to{background-position:100% 50%}}
@keyframes _7KE1Ra_stardrift{0%{transform:translate(-12px,2px);opacity:.35}45%{opacity:.9}100%{transform:translate(14px,-2px);opacity:.55}}
@media(prefers-reduced-motion:reduce){._7KE1Ra_effortPane ._7KE1Ra_effortFill::before,._7KE1Ra_effortPane ._7KE1Ra_effortRail::before,._7KE1Ra_effortPane ._7KE1Ra_effortRail::after{animation:none!important;will-change:auto}._7KE1Ra_effortTitleName,._7KE1Ra_effortDots,._7KE1Ra_effortFill::before{transition:none}}
`;
		const tagId = "@deepseek-ai/dsh-client-ui-model-selection/ModelSelect.module.css";
		if (typeof document !== "undefined") {
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-model-selection";
				tag.dataset.pluginCss = tagId;
				document.head.appendChild(tag);
			}
			tag.textContent = css + cssSlider + cssEffortGeometry + cssEffortMax + `._7KE1Ra_keyGroup{padding:2px 0 6px}._7KE1Ra_keyTitle{margin:4px 10px 2px;padding:3px 8px;border-left:2px solid var(--dsw-alias-border-l3);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._7KE1Ra_keyGroup ._7KE1Ra_option{padding-left:20px}._7KE1Ra_searchRow{position:relative;padding:2px 4px}._7KE1Ra_search{width:100%;box-sizing:border-box}._7KE1Ra_searchWithQuery input{padding-right:28px}._7KE1Ra_searchClear{position:absolute;top:50%;right:10px;z-index:1;display:flex;align-items:center;justify-content:center;width:20px;height:20px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);transform:translateY(-50%);cursor:pointer}._7KE1Ra_searchClear:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7KE1Ra_searchClear:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}`;
		}
		var ModelSelect_module_css_default = {
			"cell": "_7KE1Ra_cell",
			"cellChevron": "_7KE1Ra_cellChevron",
			"cellLabel": "_7KE1Ra_cellLabel",
			"cellValue": "_7KE1Ra_cellValue",
			"check": "_7KE1Ra_check",
			"chevron": "_7KE1Ra_chevron",
			"chevronOpen": "_7KE1Ra_chevronOpen",
			"empty": "_7KE1Ra_empty",
			"error": "_7KE1Ra_error",
			"effortDot": "_7KE1Ra_effortDot",
			"effortDots": "_7KE1Ra_effortDots",
			"effortFill": "_7KE1Ra_effortFill",
			"effortHead": "_7KE1Ra_effortHead",
			"effortHeadSpacer": "_7KE1Ra_effortHeadSpacer",
			"effortModel": "_7KE1Ra_effortModel",
			"effortPane": "_7KE1Ra_effortPane",
			"effortRail": "_7KE1Ra_effortRail",
			"effortReload": "_7KE1Ra_effortReload",
			"effortThumb": "_7KE1Ra_effortThumb",
			"effortTitle": "_7KE1Ra_effortTitle",
			"effortTitleName": "_7KE1Ra_effortTitleName",
			"effortTrack": "_7KE1Ra_effortTrack",
			"group": "_7KE1Ra_group",
			"groupTitle": "_7KE1Ra_groupTitle",
			"groups": "_7KE1Ra_groups",
			"keyGroup": "_7KE1Ra_keyGroup",
			"keyTitle": "_7KE1Ra_keyTitle",
			"menu": "_7KE1Ra_menu",
			"modelName": "_7KE1Ra_modelName",
			"option": "_7KE1Ra_option",
			"optionCopy": "_7KE1Ra_optionCopy",
			"retry": "_7KE1Ra_retry",
			"root": "_7KE1Ra_root",
			"selected": "_7KE1Ra_selected",
			"status": "_7KE1Ra_status",
			"trigger": "_7KE1Ra_trigger",
			"triggerEffort": "_7KE1Ra_triggerEffort",
			"triggerIcon": "_7KE1Ra_triggerIcon",
			"triggerLabel": "_7KE1Ra_triggerLabel",
			"warning": "_7KE1Ra_warning",
			"search": "_7KE1Ra_search",
			"searchClear": "_7KE1Ra_searchClear",
			"searchRow": "_7KE1Ra_searchRow",
			"searchWithQuery": "_7KE1Ra_searchWithQuery",
			"modelOption": "_7KE1Ra_modelOption",
			"optionActive": "_7KE1Ra_optionActive"
		};
		//#endregion
		//#region lib/types/client/provider-order.js
		/** Shared provider display order for the composer and command model pickers. */
		/**
		* Put the account and official providers first, preserving every other relative order.
		* @param groups - Provider groups in catalog order.
		* @returns a sorted copy; model order within each group is unchanged.
		*/
		function orderModelProviders(groups) {
			return groups.toSorted((left, right) => (left.id === "deepseek-account" ? 0 : left.id === "deepseek-official" ? 1 : 2) - (right.id === "deepseek-account" ? 0 : right.id === "deepseek-official" ? 1 : 2));
		}
		//#endregion
		//#region lib/types/client/ModelSelect.js
		/**
		* ModelSelect: the composer's named model seat (`conversation.input.model`).
		* Two-level selection per figma 496:26454's MenuDropdown: the root menu is
		* the Model / Effort row pair (label + current value + a right chevron),
		* each drilling into its own list — the provider-grouped model list over
		* the shared directory, and the effort levels. The trigger (313:14108's
		* ToggleButton) shows both: model name + effort in the caption tone.
		* Model catalogs above four entries show search, which retains focus while
		* ↑/↓ cycle the highlighted result; Enter and Tab accept it. Smaller model
		* catalogs, root panes, and effort panes move focus between rows. Escape and Shift+Tab leave a drilled pane first and otherwise close
		* back to the trigger. A drilled pane focuses the current effort or model
		* search field. Provider headings paint their background only while pinned
		* by scrolling. Clearing a query restores the full list and search focus.
		* Selecting restores trigger focus without a ring until the trigger loses focus
		* or the menu reopens. Model names match a case-insensitive ordered subsequence
		* within each provider group, ranked by
		* prefix, alignment score, then catalog order. Returning to the root pane
		* hands focus back to the cell that opened it. Data and submission ride the
		* same per-session ModelDirectory as the /model popup; exact-model reasoning
		* metadata and the selected effort come from the Host rather than a
		* client-owned vocabulary. A rejected selection announces through the shared
		* transient Toast anchored to the composer card; the in-menu strip with
		* Retry remains the catalog-load surface. While the directory's pending
		* selection is unsettled, the trigger shows a spinner in place of its
		* chevron, and each row whose value that selection carries shows one in place
		* of its check mark.
		*/
		/** Unplaced portal card: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real (Menu primitive's measure pass). */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* Render the composer model seat.
		* @param props - owner share (locked) + injected face (shared directory
		* store/verbs) + the standard locale seat.
		* @returns the trigger and, while open, the two-level menu.
		*/
		function ModelSelect({ locked, available, directory, load, select, t, settingsFace, effortOff = false }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [keyNamespaces, setKeyNamespaces] = (0, react.useState)(() => settingsFace?.getSnapshot().view?.namespaces ?? []);
			(0, react.useEffect)(() => {
				if (!settingsFace) return;
				let active = true;
				const update = () => { if (active) setKeyNamespaces(settingsFace.getSnapshot().view?.namespaces ?? []); };
				const unsubscribe = settingsFace.subscribe(update);
				void settingsFace.ensure().then(update).catch(() => {});
				return () => { active = false; unsubscribe(); };
			}, [settingsFace]);
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const [draftEffortIndex, setDraftEffortIndex] = (0, react.useState)(null);
			const [query, setQuery] = (0, react.useState)("");
			const [highlightedIndex, setHighlightedIndex] = (0, react.useState)(null);
			const [selectionFocus, setSelectionFocus] = (0, react.useState)(false);
			const lastActionRef = (0, react.useRef)("load");
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const searchRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const groupsRef = (0, react.useRef)(null);
			const [menuPos, setMenuPos] = (0, react.useState)(null);
			const itemRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const groups = (0, react.useMemo)(() => state.groups.toSorted((left, right) => (left.id === "deepseek-account" ? 0 : left.id === "deepseek-official" ? 1 : 2) - (right.id === "deepseek-account" ? 0 : right.id === "deepseek-official" ? 1 : 2)), [state.groups]);
			const choices = (0, react.useMemo)(() => groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning?.defaultEffort === void 0 || model.reasoning.defaultEffort === "minimal" ? {} : { reasoningEffort: model.reasoning.defaultEffort }
				}
			}))), [groups]);
			const showSearch = choices.length > 4;
			const filteredGroups = (0, react.useMemo)(() => {
				const needle = showSearch ? query.trim().toLocaleLowerCase() : "";
				return groups.map((group) => ({
					...group,
					models: needle === "" ? group.models : group.models.filter((model) => model.name.toLocaleLowerCase().includes(needle))
				})).filter((group) => group.models.length > 0);
			}, [groups, query, showSearch]);
			const keyedGroups = (0, react.useMemo)(() => filteredGroups.map((group) => ({ group, keys: modelKeyGroups(group, keyNamespaces, t) })), [filteredGroups, keyNamespaces, t]);
			const visibleModels = (0, react.useMemo)(() => filteredGroups.flatMap((group) => group.models.map((model) => ({ provider: group.id, model: model.id }))), [filteredGroups]);
			const currentVisibleIndex = visibleModels.findIndex((model) => model.provider === state.current?.provider && model.model === state.current.model);
			const activeModelIndex = Math.min(highlightedIndex ?? Math.max(0, currentVisibleIndex), visibleModels.length - 1);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current?.provider && c.selection.model === state.current.model)];
			const reasoning = currentChoice?.model.reasoning;
			const rawEffectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const legalEfforts = reasoning?.efforts?.filter((level) => level && (effortOff || level.id !== "minimal")) ?? [];
			const effectiveEffort = !effortOff && rawEffectiveEffort === "minimal" ? legalEfforts.find((level) => level.id === "low")?.id ?? legalEfforts[0]?.id : rawEffectiveEffort;
			const localizedEffortName = (id, fallback) => {
				if (id === void 0) return t("effort.providerDefault");
				if (effortOff) return fallback;
				const key = `effort.${id}`;
				const translated = t(key);
				return translated === key ? fallback : translated;
			};
			const effortLabel = reasoning === void 0 ? void 0 : localizedEffortName(effectiveEffort, reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort);
			const effortChoices = (0, react.useMemo)(() => {
				if (reasoning === void 0) return [];
				if (effortOff) return [
					...reasoning.defaultEffort === void 0 ? [{ key: "provider-default", effort: void 0, label: t("effort.providerDefault") }] : [],
					...reasoning.efforts.map(level => ({ key: `effort:${level.id}`, effort: level.id, label: level.name }))
				];
				const listed = reasoning.efforts.filter((effort) => effort && effort.id !== "minimal").map((effort) => ({
					key: `effort:${effort.id}`,
					effort: effort.id,
					label: localizedEffortName(effort.id, effort.name)
				}));
				const hasOff = listed.some((item) => item.effort === "off");
				return [
					...hasOff ? [] : [{
						key: "effort:off",
						effort: "off",
						label: localizedEffortName("off", "Off")
					}],
					...reasoning.defaultEffort === void 0 || reasoning.defaultEffort === "minimal" ? [{
						key: "provider-default",
						effort: void 0,
						label: t("effort.providerDefault")
					}] : [],
					...listed
				];
			}, [reasoning, t, effortOff]);
			const { pending } = state;
			const busy = pending !== null;
			const reload = () => {
				lastActionRef.current = "load";
				load();
			};
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (rootRef.current?.contains(event.target) === true) return;
					if (menuRef.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!showSearch) {
					setQuery("");
					setHighlightedIndex(null);
				}
			}, [showSearch]);
			const paneFocus = (0, react.useRef)(null);
			const previousShowSearch = (0, react.useRef)(showSearch);
			(0, react.useEffect)(() => {
				const changedSearchMode = previousShowSearch.current !== showSearch;
				previousShowSearch.current = showSearch;
				const intent = paneFocus.current ?? (changedSearchMode && pane === "model" ? "drill" : null);
				paneFocus.current = null;
				if (!open || intent === null) return;
				if (intent === "drill") {
					if (pane === "model" && showSearch) {
						searchRef.current?.focus();
						return;
					}
					(menuRef.current?.querySelector("[role=\"menuitemradio\"][aria-checked=\"true\"]:not([disabled])") ?? itemRefs.current.find((item) => item !== null && !item.disabled) ?? triggerRef.current)?.focus();
					return;
				}
				const cell = itemRefs.current[intent === "effort" ? 1 : 0];
				(cell !== null && cell !== void 0 && !cell.disabled ? cell : triggerRef.current)?.focus();
			}, [
				open,
				pane,
				showSearch
			]);
			(0, react.useEffect)(() => {
				const viewport = groupsRef.current;
				if (viewport === null) return;
				return (0, _deepseek_ai_dsh_client_ui_primitives.observeStickyMenuGroups)(viewport);
			}, [
				available,
				open,
				pane,
				filteredGroups
			]);
			(0, react.useLayoutEffect)(() => {
				if (open && pane === "model" && activeModelIndex >= 0) itemRefs.current[activeModelIndex]?.scrollIntoView({ block: "nearest" });
			}, [
				open,
				pane,
				activeModelIndex,
				visibleModels
			]);
			(0, react.useLayoutEffect)(() => {
				if (!open) {
					setMenuPos(null);
					return;
				}
				const place = () => {
					/* v8 ignore next 2 -- the trigger ref is attached whenever the menu is open. */
					const rect = triggerRef.current?.getBoundingClientRect();
					if (rect === void 0) return;
					const MARGIN = 12;
					const lw = menuRef.current?.offsetWidth ?? 0;
					const lh = menuRef.current?.offsetHeight ?? 0;
					let x = rect.right - lw;
					let y = rect.top - 8 - lh;
					if (lw > 0) x = Math.min(Math.max(x, MARGIN), window.innerWidth - lw - MARGIN);
					if (lh > 0) y = Math.min(Math.max(y, MARGIN), window.innerHeight - lh - MARGIN);
					setMenuPos({
						left: x,
						top: y
					});
				};
				place();
				window.addEventListener("scroll", place, true);
				window.addEventListener("resize", place);
				return () => {
					window.removeEventListener("scroll", place, true);
					window.removeEventListener("resize", place);
				};
			}, [
				open,
				pane,
				state
			]);
			if (!available) return null;
			const show = (nextPane) => {
				setSelectionFocus(false);
				setQuery("");
				setHighlightedIndex(null);
				setPane(nextPane ?? (reasoning === void 0 ? "model" : "effort"));
				setOpen(true);
				reload();
			};
			const changeQuery = (next) => {
				setQuery(next);
				setHighlightedIndex(0);
			};
			const close = (restoreFocus = false) => {
				setOpen(false);
				setPane("root");
				setDraftEffortIndex(null);
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const closeAfterSelection = () => {
				setSelectionFocus(true);
				close(true);
			};
			const drill = (next) => {
				setQuery("");
				setHighlightedIndex(null);
				paneFocus.current = "drill";
				setPane(next);
			};
			/** Leave a drilled pane for the root one, handing the keyboard back to its cell. */
			const back = (from) => {
				paneFocus.current = from;
				setPane("root");
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[active === -1 ? offset > 0 ? 0 : items.length - 1 : (active + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					if (pane === "model" && reasoning !== void 0) setPane("effort");
					else if (pane !== "root" && pane !== "effort") setPane(reasoning === void 0 ? "root" : "effort");
					else close(true);
					return;
				}
				if (!open) return;
				if (pane === "model" && showSearch && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
					event.preventDefault();
					if (!busy && visibleModels.length > 0) {
						setHighlightedIndex((activeModelIndex + (event.key === "ArrowDown" ? 1 : -1) + visibleModels.length) % visibleModels.length);
						searchRef.current?.focus();
					}
					return;
				}
				// 搜索框的 ref 指向内部 input，但菜单按键从它的外层冒泡；
				// 只要焦点在搜索区域内，就让普通输入交给输入框。
				const searchField = searchRef.current?.closest("[class*='searchRow']") ?? searchRef.current?.parentElement ?? searchRef.current;
				const typingInSearch = pane === "model" && showSearch && event.target instanceof Node && searchField?.contains(event.target) === true;
				if (typingInSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) return;
				if (typingInSearch && (event.key === "Enter" || event.key === "Tab" && !event.shiftKey)) {
					if (event.key === "Tab" && visibleModels.length === 0) return;
					event.preventDefault();
					const highlighted = visibleModels[activeModelIndex];
					if (!busy && highlighted !== void 0) choose(highlighted);
					return;
				}
				if (event.key === "Tab") {
					if (event.shiftKey) {
						event.preventDefault();
						if (pane !== "root" && state.current !== null) back(pane);
						else close(true);
						return;
					}
					const focused = document.activeElement;
					const rows = itemRefs.current.filter((item) => item !== null);
					if (focused instanceof HTMLButtonElement && rows.includes(focused)) {
						event.preventDefault();
						focused.click();
						return;
					}
					if (focused !== triggerRef.current) return;
					event.preventDefault();
					if (pane === "model" && showSearch) {
						setHighlightedIndex(null);
						searchRef.current?.focus();
						return;
					}
					(menuRef.current?.querySelector("[role=\"menuitemradio\"][aria-checked=\"true\"]:not([disabled])") ?? rows.find((item) => !item.disabled))?.focus();
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node && (rootRef.current?.contains(event.relatedTarget) === true || menuRef.current?.contains(event.relatedTarget) === true)) return;
				close();
			};
			const settleSelection = (result) => {
				if (result === void 0) return;
				if (result.ok) {
					if (rootRef.current !== null) closeAfterSelection();
					return;
				}
				const { error } = result;
				toastSeq.current += 1;
				setToast({
					seq: toastSeq.current,
					text: error.code === "session/writer-held" ? t("error.sessionInUse") : t("error.action", { message: `${error.code}: ${error.message}` })
				});
			};
			const submit = (selection) => {
				lastActionRef.current = "select";
				triggerRef.current?.focus();
				select(selection).then(settleSelection);
			};
			const choose = (selection) => {
				const backToEffort = () => {
					const snap = directory.getSnapshot();
					const group = snap.groups.find((item) => item.id === selection.provider);
					const model = group?.models.find((item) => item.id === selection.model);
					if (model?.reasoning !== void 0) setPane("effort");
					else close(true);
				};
				if (state.current?.provider === selection.provider && state.current.model === selection.model) {
					backToEffort();
					return;
				}
				lastActionRef.current = "select";
				select(selection).then((accepted) => {
					if (!accepted?.ok) settleSelection(accepted);
					else backToEffort();
				});
			};
			const chooseEffort = (effort, keepOpen = false) => {
				if (state.current === null) return;
				if (rawEffectiveEffort === effort) {
					setDraftEffortIndex(null);
					if (!keepOpen) close(true);
					return;
				}
				const selection = {
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				};
				lastActionRef.current = "select";
				select(selection).then((accepted) => {
					setDraftEffortIndex(null);
					if (keepOpen) {
						if (!accepted?.ok) settleSelection(accepted);
						return;
					}
					settleSelection(accepted);
				});
			};
			const committedEffortIndex = Math.max(0, effortChoices.findIndex((level) => level.effort === effectiveEffort));
			const effortIndex = draftEffortIndex ?? committedEffortIndex;
			const shownEffort = effortChoices[effortIndex];
			const shownEffortLabel = shownEffort === void 0 ? effortLabel : shownEffort.label;
			const startEffortDrag = (event) => {
				if (effortChoices.length === 0) return;
				event.preventDefault();
				event.stopPropagation();
				const track = event.currentTarget;
				if (typeof track.setPointerCapture === "function" && event.pointerId !== void 0) {
					try { track.setPointerCapture(event.pointerId); } catch {}
				}
				const indexFromEvent = (ev) => {
					const rect = track.getBoundingClientRect();
					const max = Math.max(effortChoices.length - 1, 1);
					const pad = parseFloat(getComputedStyle(track).getPropertyValue("--effort-inset")) || 16;
					const span = Math.max(rect.width - pad * 2, 1);
					const ratio = (ev.clientX - rect.left - pad) / span;
					return Math.min(effortChoices.length - 1, Math.max(0, Math.round(ratio * max)));
				};
				const apply = (ev) => setDraftEffortIndex(indexFromEvent(ev));
				apply(event);
				const onMove = (ev) => apply(ev);
				const finish = (ev) => {
					track.removeEventListener("pointermove", onMove);
					track.removeEventListener("pointerup", finish);
					track.removeEventListener("pointercancel", finish);
					const next = effortChoices[indexFromEvent(ev)];
					if (next) chooseEffort(next.effort, true);
					else setDraftEffortIndex(null);
				};
				track.addEventListener("pointermove", onMove);
				track.addEventListener("pointerup", finish);
				track.addEventListener("pointercancel", finish);
			};
			const waiting = state.current === null && state.status === "loading";
			const modelLabel = waiting ? t("trigger.loading") : currentChoice?.model.name ?? (state.current === null ? t("trigger.fallback") : `${state.current.provider}/${state.current.model}`);
			const providerLabel = currentChoice?.group?.name ?? (state.current === null ? void 0 : state.current.provider);
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			const triggerAria = waiting ? t("trigger.loading") : state.current === null ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", {
				model: modelLabel,
				effort: effortLabel
			});
			itemRefs.current = [];
			let itemIndex = 0;
			let modelIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ModelSelect_module_css_default.root,
				onKeyDown: onRootKeyDown,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						className: ModelSelect_module_css_default.trigger,
						"aria-label": triggerAria,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						"aria-controls": open ? `${id}-menu` : void 0,
						title: triggerLabel,
						"aria-busy": busy,
						"data-selection-focus": selectionFocus ? "" : void 0,
						onBlur: () => {
							setSelectionFocus(false);
						},
						disabled: locked,
						onClick: () => {
							if (open) close(true);
							else show();
						},
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular, {
								className: ModelSelect_module_css_default.triggerIcon,
								size: 16
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerLabel,
								children: providerLabel === void 0 ? modelLabel : `${providerLabel} · ${modelLabel}`
							}),
							effortLabel !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerEffort,
								children: effortLabel
							}),
							busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(ModelSelect_module_css_default.chevron, open && ModelSelect_module_css_default.chevronOpen) })
						]
					}),
					open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
						ref: menuRef,
						id: `${id}-menu`,
						className: ModelSelect_module_css_default.menu,
						style: menuPos ?? MEASURE_STYLE,
						role: "menu",
						tabIndex: -1,
						onMouseDown: (event) => {
							const target = event.target;
							if (target instanceof Element && target.closest("input, textarea, [contenteditable='true']") !== null) return;
							event.preventDefault();
						},
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						children: [
							pane === "root" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: () => {
									drill("model");
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.model")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: modelLabel
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
								]
							}), reasoning !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: () => {
									drill("effort");
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.effort")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: effortLabel
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
								]
							})] }),
							pane === "model" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								showSearch && (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.searchRow,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
										ref: searchRef,
										className: clsx(ModelSelect_module_css_default.search, query !== "" && ModelSelect_module_css_default.searchWithQuery),
										type: "text",
										role: "searchbox",
										"aria-label": t("search.placeholder"),
										"aria-controls": `${id}-models`,
										"aria-activedescendant": activeModelIndex < 0 ? void 0 : `${id}-model-${activeModelIndex}`,
										placeholder: t("search.placeholder"),
										value: query,
										readOnly: busy,
										onChange: (event) => {
											changeQuery(event.target.value);
										}
									}), query !== "" && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.searchClear,
										"aria-label": t("search.clear"),
										disabled: busy,
										onClick: () => {
											changeQuery("");
											searchRef.current?.focus();
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, {})
									})]
								}),
								state.status === "loading" && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.status,
									children: t("status.loading")
								}),
								state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.error,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("retry")
									})]
								}),
								state.failures.map((failure) => (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.warning,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
										name: failure.id === "deepseek-account" ? t("provider.account") : failure.name,
										message: failure.message
									}) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("retry")
									})]
								}, failure.id)),
								(0, react_jsx_runtime.jsx)("div", {
									ref: groupsRef,
									className: clsx(ModelSelect_module_css_default.groups, "scrollable"),
									children: keyedGroups.map(({ group, keys }) => {
										const headingId = `${id}-${group.id}`;
										return (0, react_jsx_runtime.jsxs)("section", {
											role: "group",
											"aria-labelledby": headingId,
											className: ModelSelect_module_css_default.group,
											children: [(0, react_jsx_runtime.jsx)("div", {
												className: ModelSelect_module_css_default.groupTitle,
												id: headingId,
												children: group.id === "deepseek-account" ? t("provider.account") : group.name
											}), keys.map((keyBucket) => react.createElement("div", {
												key: keyBucket.id,
												className: ModelSelect_module_css_default.keyGroup,
												role: "group",
												"aria-label": keyBucket.label
											}, react.createElement("div", { className: ModelSelect_module_css_default.keyTitle, title: keyBucket.label }, keyBucket.label), keyBucket.models.map((model) => {
												const index = modelIndex++;
												const selected = state.current?.provider === group.id && state.current.model === model.id;
												return (0, react_jsx_runtime.jsxs)("button", {
													ref: itemRef(),
													type: "button",
													role: "menuitemradio",
													"aria-checked": selected,
													className: clsx(ModelSelect_module_css_default.option, selected && ModelSelect_module_css_default.selected),
													title: model.name,
													disabled: busy,
													onClick: () => {
														choose({
															provider: group.id,
															model: model.id
														});
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.optionCopy,
														children: (0, react_jsx_runtime.jsx)("span", {
															className: ModelSelect_module_css_default.modelName,
															children: model.name
														})
													}), (0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.check,
														children: pending?.provider === group.id && pending.model === model.id ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : selected ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
													})]
												}, model.id);
											})))]
										}, group.id);
									})
								}),
								state.status === "ready" && choices.length === 0 && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									children: t("empty.models")
								})
							] }),
							pane === "effort" && (0, react_jsx_runtime.jsxs)("div", {
								className: ModelSelect_module_css_default.effortPane,
								"data-max": effortChoices.length > 1 && effortIndex === effortChoices.length - 1,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: ModelSelect_module_css_default.effortHead,
										children: [
											(0, react_jsx_runtime.jsx)("div", { className: ModelSelect_module_css_default.effortHeadSpacer }),
											(0, react_jsx_runtime.jsxs)("button", {
												ref: itemRef(),
												type: "button",
												className: ModelSelect_module_css_default.effortTitle,
												onClick: () => setPane("model"),
												children: [
													(0, react_jsx_runtime.jsxs)("span", {
													className: ModelSelect_module_css_default.effortTitleName,
													children: [
														shownEffortLabel ?? t("menu.effort"),
														(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
													]
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: ModelSelect_module_css_default.effortModel,
													children: modelLabel
												})
												]
											}),
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: ModelSelect_module_css_default.effortReload,
												"data-busy": state.status === "loading" || busy,
												"aria-label": t("action.reload"),
												title: t("action.reload"),
												onClick: reload,
												children: (0, react_jsx_runtime.jsxs)("svg", {
													width: 16,
													height: 16,
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: 1.8,
													strokeLinecap: "round",
													strokeLinejoin: "round",
													"aria-hidden": true,
													children: [
														(0, react_jsx_runtime.jsx)("path", { d: "M20 7v5h-5" }),
														(0, react_jsx_runtime.jsx)("path", { d: "M4 17v-5h5" }),
														(0, react_jsx_runtime.jsx)("path", { d: "M6.1 7a7 7 0 0 1 11.5-1L20 9" }),
														(0, react_jsx_runtime.jsx)("path", { d: "M4 15l2.4 3A7 7 0 0 0 18 17" })
													]
												})
											})
										]
									}),
									state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
										className: ModelSelect_module_css_default.error,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ModelSelect_module_css_default.retry,
											onClick: reload,
											children: t("action.reload")
										})]
									}),
									effortChoices.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
										className: ModelSelect_module_css_default.empty,
										children: t("empty.efforts")
									}) : effortOff ? effortChoices.map(level => (0, react_jsx_runtime.jsxs)("button", {
										ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": effectiveEffort === level.effort,
										className: clsx(ModelSelect_module_css_default.option, effectiveEffort === level.effort && ModelSelect_module_css_default.selected),
										disabled: busy, onClick: () => chooseEffort(level.effort),
										children: [(0, react_jsx_runtime.jsx)("span", { className: ModelSelect_module_css_default.optionCopy, children: level.label }),
											(0, react_jsx_runtime.jsx)("span", { className: ModelSelect_module_css_default.check, children: effectiveEffort === level.effort ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null })]
									}, level.key)) : (0, react_jsx_runtime.jsxs)("div", {
										ref: itemRef(),
										role: "slider",
										tabIndex: 0,
										className: ModelSelect_module_css_default.effortTrack,
										"aria-label": t("menu.effort"),
										"aria-valuemin": 0,
										"aria-valuemax": Math.max(effortChoices.length - 1, 0),
										"aria-valuenow": effortIndex,
										"aria-valuetext": shownEffortLabel,
										style: { "--dsh-effort-fill": effortChoices.length <= 1 ? 100 : effortIndex / (effortChoices.length - 1) * 100 },
										onPointerDown: startEffortDrag,
										onKeyDown: (event) => {
											let next = effortIndex;
											if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 1;
											else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 1;
											else if (event.key === "Home") next = 0;
											else if (event.key === "End") next = effortChoices.length - 1;
											else return;
											event.preventDefault();
											next = Math.min(effortChoices.length - 1, Math.max(0, next));
											setDraftEffortIndex(next);
											const level = effortChoices[next];
											if (level) chooseEffort(level.effort, true);
										},
										children: [
											(0, react_jsx_runtime.jsxs)("div", {
												className: ModelSelect_module_css_default.effortRail,
												children: [
													(0, react_jsx_runtime.jsx)("div", { className: ModelSelect_module_css_default.effortFill }),
													(0, react_jsx_runtime.jsx)("div", {
														className: ModelSelect_module_css_default.effortDots,
														"aria-hidden": true,
														children: effortChoices.map((level, i) => (0, react_jsx_runtime.jsx)("span", {
															className: ModelSelect_module_css_default.effortDot,
															"data-on": i <= effortIndex
														}, level.key))
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("div", { className: ModelSelect_module_css_default.effortThumb })
										]
									})
								]
							})
						]
					}), document.body),
					toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => {
							setToast(null);
						}
					}, toast.seq)
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/**
		* `model` namespace dictionaries.
		*
		* `trigger.selectAria` intentionally matches `trigger.fallback` but remains a
		* separate key: the visible fallback label and the accessible name of
		* an unset trigger are free to diverge per locale, and folding it into
		* `trigger.aria` would announce the degenerate "Select model, current Select
		* model".
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"provider.account": "DeepSeek 账号",
			"command.label": "模型",
			"command.description": "选择本会话使用的模型",
			"option.loadError": "目录加载失败：{message}",
			"trigger.fallback": "请选择模型",
			"trigger.loading": "正在加载模型…",
			"trigger.selectAria": "请选择模型",
			"trigger.aria": "选择模型，当前 {model}",
			"trigger.ariaEffort": "选择模型，当前 {model}，推理等级 {effort}",
			"menu.aria": "模型与推理等级",
			"menu.model": "模型",
			"key.default": "默认密钥",
			"key.unnamed": "未命名密钥",
			"key.unavailable": "已移除的密钥",
			"menu.effort": "推理等级",
			"effort.providerDefault": "默认",
			"effort.off": "无",
			"effort.low": "低",
			"effort.medium": "中等",
			"effort.high": "高",
			"effort.xhigh": "极高",
			"effort.max": "最大",
			"status.loading": "正在刷新模型列表…",
			"error.action": "模型操作失败：{message}",
			"error.sessionInUse": "当前会话已被占用，可能是其他正在运行的 DSH 导致的（如其他 dsh web、桌面端），请退出其他正在运行的 DSH 后重试。",
			"action.reload": "重新加载",
			"warning.groupLoad": "{name} 加载失败：{message}",
			"search.placeholder": "搜索模型…",
			"search.clear": "清除搜索",
			"search.empty": "没有匹配的模型。",
			"empty.models": "没有可用的模型。",
			"empty.efforts": "当前模型未提供推理等级。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"provider.account": "DeepSeek Account",
			"command.label": "Model",
			"command.description": "Select the model for this conversation",
			"option.loadError": "Catalog failed to load: {message}",
			"trigger.fallback": "Select model",
			"trigger.loading": "Loading models…",
			"trigger.selectAria": "Select model",
			"trigger.aria": "Select model, current {model}",
			"trigger.ariaEffort": "Select model, current {model}, reasoning effort {effort}",
			"menu.aria": "Model and reasoning effort",
			"menu.model": "Model",
			"key.default": "Default key",
			"key.unnamed": "Unnamed key",
			"key.unavailable": "Removed key",
			"menu.effort": "Effort",
			"effort.providerDefault": "Default",
			"effort.off": "None",
			"effort.low": "Low",
			"effort.medium": "Medium",
			"effort.high": "High",
			"effort.xhigh": "Xhigh",
			"effort.max": "Max",
			"status.loading": "Refreshing model list…",
			"error.action": "Model operation failed: {message}",
			"error.sessionInUse": "This session is already in use, possibly by another running DSH instance (such as dsh web or the desktop app). Quit other running DSH instances and try again.",
			"action.reload": "Reload",
			"warning.groupLoad": "{name} failed to load: {message}",
			"search.placeholder": "Search models…",
			"search.clear": "Clear search",
			"search.empty": "No matching models.",
			"empty.models": "No models available.",
			"empty.efforts": "This model provides no reasoning effort levels."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** One selectable row's id: an opaque row key (resolved by lookup, never parsed). */
		function rowId(providerId, modelId) {
			return `${providerId}/${modelId}`;
		}
		const BUILTIN_DESCRIPTION_KEYS = {
			"deepseek-account/deepseek-v4-flash": "option.deepseekV4Flash.description",
			"deepseek-account/deepseek-v4-pro": "option.deepseekV4Pro.description",
			"deepseek-official/deepseek-v4-flash": "option.deepseekV4Flash.description",
			"deepseek-official/deepseek-v4-pro": "option.deepseekV4Pro.description"
		};
		function descriptionOf(providerId, model, t) {
			const key = BUILTIN_DESCRIPTION_KEYS[rowId(providerId, model.id)];
			return key !== void 0 && model.description === en[key] ? t(key) : model.description;
		}
		// The catalog contains routable model ids; the settings mirror owns local key names.
		// Match only exact ids so two aliases of one upstream model retain separate keys.
		function modelKeyGroups(group, namespaces, t) {
			const namespace = group.id === "deepseek-official" ? "llm-deepseek-api-key" : "llm-pi-ai";
			const settings = namespaces.find((item) => item.ns === namespace)?.value;
			const profile = group.id === "deepseek-official" ? settings : settings?.providers?.[group.id];
			const keys = Array.isArray(profile?.apiKeys) ? profile.apiKeys : [];
			const entries = Array.isArray(profile?.models) ? profile.models : [];
			const buckets = new Map(keys.map((key) => [key.id, { id: key.id, label: key.name || t("key.unnamed"), models: [] }]));
			const fallback = keys.find((key) => key.id === profile?.activeApiKey)?.id ?? keys[0]?.id;
			for (const model of group.models) {
				const configured = entries.find((entry) => entry.id === model.id) ?? profile?.modelOverrides?.[model.id];
				const keyId = configured?.apiKey ?? fallback;
				if (keyId && !buckets.has(keyId)) buckets.set(keyId, { id: keyId, label: t("key.unavailable"), models: [] });
				const bucket = buckets.get(keyId) ?? buckets.get("");
				if (bucket) bucket.models.push(model);
				else buckets.set("", { id: "", label: t("key.default"), models: [model] });
			}
			return [...buckets.values()].filter((bucket) => bucket.models.length > 0);
		}
		/** Flatten the directory into popup rows; failure rows are listed for visibility but never selectable. */
		function optionsOf(directory, t) {
			const rows = [];
			for (const group of directory.groups) {
				const name = group.id === "deepseek-account" ? t("provider.account") : group.name;
				for (const model of group.models) {
					const description = descriptionOf(group.id, model, t);
					rows.push({
						id: rowId(group.id, model.id),
						label: model.name,
						detail: description !== void 0 ? `${name} · ${description}` : name,
						...directory.current !== null && directory.current.provider === group.id && directory.current.model === model.id ? { active: true } : {}
					});
				}
			}
			for (const failure of directory.failures) rows.push({
				id: `failure/${failure.id}`,
				label: failure.id === "deepseek-account" ? t("provider.account") : failure.name,
				detail: t("option.loadError", { message: failure.message })
			});
			return rows;
		}
		/**
		* Resolve a picked row back to its model selection by matching against the loaded
		* groups (the same data the rows were built from — ids stay opaque).
		* @param state - the session's directory snapshot.
		* @param id - the picked row id.
		* @returns the row's model selection, or undefined for failure rows / stale ids.
		*/
		function selectionOf(state, id) {
			for (const group of state.groups) for (const model of group.models) {
				if (rowId(group.id, model.id) !== id) continue;
				const requestedEffort = state.current?.provider === group.id && state.current.model === model.id ? state.current?.reasoningEffort ?? model.reasoning?.defaultEffort : model.reasoning?.defaultEffort;
				const availableEfforts = model.reasoning?.efforts?.filter((effort) => effort && effort.id !== "minimal") ?? [];
				const reasoningEffort = requestedEffort === "minimal" ? availableEfforts.find((effort) => effort.id === "low")?.id ?? availableEfforts[0]?.id : requestedEffort;
				return {
					provider: group.id,
					model: model.id,
					...reasoningEffort === void 0 ? {} : { reasoningEffort }
				};
			}
		}
		/** Dictionary namespace owned by this plugin. */
		const NS = "model";
		/** Required services: the contribution registry, the seat's slot registry, locale, and the service's own faces. */
		const inject = [
			"commandUi",
			"locale",
			"sessions",
			"slots",
			"remote",
			"remote.session",
			"configForms"
		];
		/**
		* Client plugin body: mount ModelDirectoryResolver, register the `model` dictionaries,
		* then register the /model popup contribution and the composer model seat
		* over the service.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const compatOff = compatLayerOff;
			// tools/client-sources.mjs 在 factory 中选择官方原始客户端；此处仅运行增强版。
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-model-selection: dictionaries");
			const t = ctx.locale.bind(NS);
			const settingsFace = ctx.configForms.describe();
			ctx.plugin(ModelDirectoryResolver);
			// 「思考滑条」关闭时恢复普通档位按钮，保留推理设置与模型选择。
			const effortOff = compatOff("effort");
			ctx.inject(["commandUi", "modelDirectories"], (scope) => {
				const command = scope.get("commandUi");
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.effect(() => command.register({
					name: "model",
					label: () => t("command.label"),
					description: () => t("command.description"),
					icon: _deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular,
					available: (session) => sessions.subagentAddress(session.sessionId) === void 0,
					ui: {
						kind: "popupSelect",
						searchMode: "fuzzy-label",
						searchLabels: () => ({
							placeholder: t("search.placeholder"),
							empty: t("empty.models"),
							noResults: t("search.empty")
						}),
						options: async (session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							return optionsOf(await models.directoryFor(session.sessionId).load(), t);
						},
						onSelect: async (option, session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							const directory = models.directoryFor(session.sessionId);
							const selection = selectionOf(directory.store.getSnapshot(), option.id);
							if (selection === void 0) throw new Error("this provider's catalog failed to load — pick a model from a loaded group");
							const result = await directory.select(selection);
							if (!result.ok) {
								if (result.error.code === "session/writer-held") throw new Error(t("error.sessionInUse"));
								throw result.error;
							}
						}
					}
				}), "ui-model-selection: /model contribution");
			});
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.slots.inject("conversation.input.model", () => scope.slots.register({
					name: "conversation.input.model",
					locale: NS,
					inject: (sessionId) => {
						const directory = models.directoryFor(sessionId);
						const available = sessions.subagentAddress(sessionId) === void 0;
						return {
							available,
							effortOff,
							settingsFace,
							directory: directory.store,
							load: () => {
								if (available) directory.load().catch(() => {});
							},
							select: (selection) => available ? directory.select(selection) : Promise.resolve(void 0)
						};
					}
				}, ModelSelect));
			});
		}
		//#endregion
		exports.ModelDirectory = ModelDirectory;
		exports.ModelDirectoryResolver = ModelDirectoryResolver;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
