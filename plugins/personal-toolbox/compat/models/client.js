window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-settings-models",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		/*COMPAT_PREFERENCES*/
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/apiKey.js
		/**
		* Browser-side judgement of a typed API key.
		* @module @deepseek-ai/dsh-client-ui-settings-models/apiKey
		*/
		/**
		* Twin of `normalizeApiKey` in `@deepseek-ai/dsh-llm`: printable ASCII, space
		* excluded. Client packages reference only client packages, so the charset
		* rule is mirrored here rather than imported; keep the two in step, as
		* `validateDeepSeekModels` is kept in step with the host's `catalogModel`.
		*/
		const LEGAL_API_KEY = /^[\x21-\x7E]+$/;
		/**
		* A pasted `NAME=value` environment line. Two narrowings keep real keys clear
		* of it: the name must be upper-case, so `sk-` forms break at the hyphen, and
		* the `=` must be followed by something other than another `=`, so base64
		* padding on an all-upper-case key (`ABCD==`) is not mistaken for an
		* assignment. This heuristic runs only here — a resolver applying it could
		* lock a user out of a gateway whose key legitimately takes this shape, with
		* the environment refusing it too and no way through.
		*/
		const ENV_LINE = /^[A-Z][A-Z0-9_]*=[^=]/;
		/** Whether a value is wrapped in one matching pair of quotes. */
		function isQuoted(value) {
			const first = value[0];
			if (first !== "\"" && first !== "'" && first !== "`") return false;
			return value.length > 1 && value.endsWith(first);
		}
		/**
		* Judge the key input's current value.
		*
		* An empty field is not a failure: every card opens with it empty even when a
		* key is already stored, where it means keep that one. A field holding only
		* whitespace is a failure rather than an empty field, so typed input is never
		* silently discarded.
		* @param draft - the key input's current value, untrimmed.
		* @returns the copy key for a field-level failure, or `undefined` to allow submit.
		*/
		function apiKeyFailure(draft) {
			if (draft.length === 0) return void 0;
			const value = draft.trim();
			if (value.length === 0) return "keyBlank";
			if (ENV_LINE.test(value) || isQuoted(value)) return "keyIllegalCharacters";
			if (!LEGAL_API_KEY.test(value)) return "keyIllegalCharacters";
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-settings-models/src/client/ModelsSection.module.css.mjs
		const css$3 = ".zGbnIq_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}.zGbnIq_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}.zGbnIq_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}.zGbnIq_notice{color:var(--dsw-alias-state-warn-label);margin:0;font-size:12px;line-height:18px}.zGbnIq_savedNotice{color:var(--dsw-alias-state-success-primary);margin:0;font-size:12px;line-height:18px}.zGbnIq_rows{flex-direction:column;gap:8px;margin:12px 0 0;padding:0;list-style:none;display:flex}.zGbnIq_rowCard{border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;flex-direction:column;gap:12px;padding:12px 14px;display:flex}.zGbnIq_rowHead{align-items:center;gap:10px;display:flex}.zGbnIq_rowIdentity{align-items:center;gap:6px;min-width:0;display:inline-flex}.zGbnIq_rowName{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}.zGbnIq_rowTag{border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;padding:1px 6px;font-size:11px;line-height:16px}.zGbnIq_credentialDot{box-sizing:border-box;corner-shape:round;border-radius:50%;flex:none;width:8px;height:8px;display:inline-block}.zGbnIq_credentialDotConfigured{background:var(--dsw-alias-state-success-primary)}.zGbnIq_credentialDotMissing{background:var(--dsw-alias-state-error-primary)}.zGbnIq_rowActions{align-items:center;gap:4px;margin-left:auto;display:inline-flex}.zGbnIq_primaryButton,.zGbnIq_secondaryButton,.zGbnIq_addButton{box-sizing:border-box;height:36px;font:inherit;cursor:pointer;border:none;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.zGbnIq_primaryButton{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}.zGbnIq_primaryButton:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.zGbnIq_secondaryButton,.zGbnIq_addButton{border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);background:0 0}.zGbnIq_secondaryButton:hover:not(:disabled),.zGbnIq_addButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.zGbnIq_secondaryButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}.zGbnIq_dangerButton{box-sizing:border-box;height:36px;color:var(--dsw-alias-state-error-primary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:18px;justify-content:center;align-items:center;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.zGbnIq_dangerButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}.zGbnIq_rowActions .zGbnIq_secondaryButton,.zGbnIq_rowActions .zGbnIq_dangerButton{border-radius:14px;height:28px;padding:0 10px;font-size:12px;line-height:18px}.zGbnIq_primaryButton:disabled,.zGbnIq_secondaryButton:disabled,.zGbnIq_dangerButton:disabled,.zGbnIq_addButton:disabled,.zGbnIq_linkButton:disabled,.zGbnIq_addModelButton:disabled{opacity:.4;cursor:default}.zGbnIq_primaryButton:focus-visible,.zGbnIq_secondaryButton:focus-visible,.zGbnIq_dangerButton:focus-visible,.zGbnIq_addButton:focus-visible,.zGbnIq_linkButton:focus-visible,.zGbnIq_addModelButton:focus-visible,.zGbnIq_iconButton:focus-visible,.zGbnIq_customizedSummary:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}.zGbnIq_editor{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex-direction:column;gap:14px;padding:14px 16px;display:flex}.zGbnIq_editorHeader{align-items:baseline;gap:8px;display:flex}.zGbnIq_editorTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}.zGbnIq_editorRoute{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.zGbnIq_field{flex-direction:column;gap:6px;display:flex}.zGbnIq_fieldLabel{color:var(--dsw-alias-label-secondary);align-items:center;gap:10px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex}.zGbnIq_linkButton{box-sizing:border-box;height:28px;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:14px;align-items:center;padding:0 10px;font-size:12px;line-height:18px;display:inline-flex}.zGbnIq_linkButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.zGbnIq_advancedHint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}.zGbnIq_editorActions{justify-content:flex-end;gap:8px;display:flex}.zGbnIq_addBlock{flex-direction:column;gap:12px;display:flex}.zGbnIq_addActions{flex-wrap:wrap;gap:10px;display:flex}.zGbnIq_addButton{border:1px dashed var(--dsw-alias-border-l3);border-radius:16px;flex:1 1 0;gap:6px;min-width:180px;height:44px}.zGbnIq_addCard,.zGbnIq_setupCard{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex-direction:column;gap:14px;padding:14px 16px;list-style:none;display:flex}.zGbnIq_addCard .zGbnIq_editor,.zGbnIq_setupCard .zGbnIq_editor{background:0 0;padding:0}.zGbnIq_customized{border-top:.5px solid var(--dsw-alias-border-l2);padding-top:10px}.zGbnIq_customizedSummary{cursor:pointer;width:fit-content;color:var(--dsw-alias-label-secondary);border-radius:6px;align-items:center;gap:6px;margin-left:-4px;padding:2px 4px;font-size:12px;font-weight:500;line-height:18px;list-style:none;display:flex}.zGbnIq_customizedSummary::-webkit-details-marker{display:none}.zGbnIq_customizedSummary:before{content:\"\";border-bottom:1.5px solid;border-right:1.5px solid;width:5px;height:5px;transition:transform .12s;transform:rotate(-45deg)translate(-1px,-1px)}.zGbnIq_customized[open]>.zGbnIq_customizedSummary:before{transform:rotate(45deg)translate(-1px,-1px)}.zGbnIq_customizedSummary:hover{color:var(--dsw-alias-label-primary)}.zGbnIq_customizedBody{flex-direction:column;gap:12px;padding-top:12px;display:flex}.zGbnIq_modelCatalog{border-top:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:10px;padding-top:12px;display:flex}.zGbnIq_modelCatalogHeading{flex-direction:column;gap:2px;display:flex}.zGbnIq_modelCatalogTitle{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}.zGbnIq_modelCatalogMeta,.zGbnIq_modelEmpty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}.zGbnIq_modelList{flex-direction:column;gap:8px;display:flex}.zGbnIq_modelListHead{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.zGbnIq_modelEntry{border:.5px solid var(--dsw-alias-border-l4);border-radius:10px;padding:6px}.zGbnIq_modelRow{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto auto;align-items:center;gap:6px;display:grid}.zGbnIq_iconButton{box-sizing:border-box;width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;display:inline-flex}.zGbnIq_iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.zGbnIq_iconButton:disabled{cursor:default;opacity:.4}.zGbnIq_iconButtonDanger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}.zGbnIq_modelAdvanced{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;padding:8px 4px 2px;display:grid}.zGbnIq_modelField{flex-direction:column;gap:4px;display:flex}.zGbnIq_modelFieldLabel{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.zGbnIq_modelEmpty{border:1px dashed var(--dsw-alias-border-l3);text-align:center;border-radius:8px;padding:12px}.zGbnIq_addModelButton{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);height:28px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:14px;align-self:flex-start;align-items:center;gap:4px;padding:0 10px;font-size:12px;line-height:18px;display:inline-flex}.zGbnIq_addModelButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.zGbnIq_input{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);width:100%;height:32px;font:inherit;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;font-size:14px;line-height:22px}select.zGbnIq_input{cursor:pointer;max-width:240px}.zGbnIq_input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}.zGbnIq_input::placeholder{color:var(--dsw-alias-label-dimmed)}.zGbnIq_input:disabled{opacity:.6;cursor:default}.zGbnIq_selectInput{appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");background-position:right 12px center;background-repeat:no-repeat;background-size:12px 12px;padding-right:32px}.zGbnIq_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}.zGbnIq_deleteDialog{width:min(480px,100%)}.zGbnIq_deleteConfirm:not(:disabled){border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}.zGbnIq_deleteConfirm:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}.zGbnIq_hiddenLabel{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){.zGbnIq_customizedSummary:before,.zGbnIq_switchThumb{transition:none}}.zGbnIq_fetchDialog{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);max-width:520px}.zGbnIq_candidateToolbar{align-items:center;gap:8px;margin-bottom:6px;display:flex}.zGbnIq_candidateSearch{flex:240px;min-width:0}.zGbnIq_candidateList{flex-direction:column;gap:2px;max-height:320px;margin:0;padding:0;list-style:none;display:flex;overflow-y:auto}.zGbnIq_candidate{border-radius:6px}.zGbnIq_candidateLabel{cursor:pointer;align-items:center;gap:8px;padding:6px 8px;display:flex}.zGbnIq_candidateId{font-family:var(--ds-font-family-code);overflow-wrap:anywhere;flex:auto;font-size:13px}.zGbnIq_candidateEmpty{color:var(--dsw-alias-label-secondary);text-align:center;margin:24px 0;font-size:13px;line-height:20px}";
		const editorDialogCss = ".zGbnIq_editorModal.zGbnIq_editorModal{box-sizing:border-box!important;width:min(900px,calc(100vw - 32px))!important;max-width:900px!important;height:min(820px,calc(100dvh - 48px))!important;max-height:calc(100dvh - 48px)!important;display:flex;flex-direction:column;overflow:hidden}.zGbnIq_editorModal>div{box-sizing:border-box;width:100%;max-width:100%;min-width:0}.zGbnIq_editorModal>div:first-child{display:flex;flex-direction:column;flex:1;min-height:0;padding:20px 28px!important}.zGbnIq_editorModal>div:first-child>div:first-child{flex:none;min-width:0;max-width:100%}.zGbnIq_editorModal>div:first-child>div:last-child{box-sizing:border-box;min-width:0;min-height:0;flex:1;max-width:100%;display:flex;flex-direction:column;overflow:hidden}.zGbnIq_editorModal>div:last-child{box-sizing:border-box;width:100%;max-width:100%;min-width:0;padding:0 28px 18px!important}.zGbnIq_editorModal .zGbnIq_editor{width:100%;max-width:100%;min-width:0;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;box-sizing:border-box;background:transparent;padding:0;gap:0}.zGbnIq_editorModal .zGbnIq_queryEntry{flex:none}.zGbnIq_editorModal .zGbnIq_editorScroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;padding:0 10px 12px 0;display:flex;flex-direction:column;gap:18px}.zGbnIq_editorModal .zGbnIq_editorHeader{padding-bottom:8px;border-bottom:1px solid var(--dsw-alias-border-l3)}.zGbnIq_editorModal .zGbnIq_editorTitle{font-size:18px;font-weight:600}.zGbnIq_editorModal .zGbnIq_customized{display:block;min-width:0;max-width:100%;padding:18px 0 0;border-top:1px solid var(--dsw-alias-border-l3)}.zGbnIq_editorModal .zGbnIq_customized>div:first-child{font-size:15px;font-weight:600;margin-bottom:4px}.zGbnIq_editorModal .zGbnIq_modelCatalog{min-width:0;max-width:100%;padding:18px 0 0;border-top:1px solid var(--dsw-alias-border-l3)}.zGbnIq_editorModal .zGbnIq_modelCatalogTitle{font-size:15px;font-weight:600}.zGbnIq_editorModal .zGbnIq_modelList{gap:10px}.zGbnIq_editorModal .zGbnIq_modelEntry{min-width:0;max-width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l3);border-radius:12px;padding:10px}.zGbnIq_editorModal .zGbnIq_modelRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 30px 30px;min-width:0;max-width:100%;box-sizing:border-box}.zGbnIq_editorModal .zGbnIq_modelRow>*{min-width:0;max-width:100%;box-sizing:border-box}.zGbnIq_editorModal .zGbnIq_modelRow input{min-width:0;max-width:100%;box-sizing:border-box}.zGbnIq_editorModal .zGbnIq_editorActions{position:static;flex:none;box-sizing:border-box;width:100%;max-width:100%;min-width:0;justify-content:flex-end;flex-wrap:wrap;gap:8px;background:var(--dsw-alias-bg-module-platform);padding:14px 0 0;margin:0;border-top:1px solid var(--dsw-alias-border-l3)}.zGbnIq_editorModal .zGbnIq_editorActions>*{box-sizing:border-box;flex:none}@media(max-width:600px){.zGbnIq_editorModal.zGbnIq_editorModal{width:calc(100vw - 24px)!important;height:calc(100dvh - 32px)!important;max-height:calc(100dvh - 32px)!important}.zGbnIq_editorModal>div:first-child{padding:16px!important}.zGbnIq_editorModal>div:last-child{padding:0 16px 14px!important}.zGbnIq_editorModal .zGbnIq_modelRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 28px 28px}}";
		// Keep the scroll gutter stable; reveal a slim thumb on pointer/keyboard interaction.
		const editorScrollCss = `
		.zGbnIq_providerEnable{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l3)}
		.zGbnIq_providerEnable strong{display:block;font-size:14px;font-weight:600}.zGbnIq_providerEnable p{margin:5px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
		.zGbnIq_providerSwitch{position:relative;flex:none;width:42px;height:24px;padding:0;border:1px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-label-tertiary);cursor:pointer}
		.zGbnIq_providerSwitch[aria-checked=true]{background:#3276ed;border-color:#3276ed}.zGbnIq_providerSwitch:after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;corner-shape:round;transition:transform .15s}.zGbnIq_providerSwitch[aria-checked=true]:after{transform:translateX(18px)}.zGbnIq_providerSwitch:disabled{opacity:.5;cursor:default}.zGbnIq_providerSwitch:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:3px}
		.zGbnIq_editorModal .zGbnIq_editorScroll {
			scrollbar-width: thin;
			scrollbar-color: transparent transparent;
		}
		.zGbnIq_editorModal .zGbnIq_editorScroll:is(:hover,:focus-within) {
			scrollbar-color: var(--dsw-alias-scrollbar-bg-l2, #bfc2c8) transparent;
		}
		@supports selector(::-webkit-scrollbar) {
			.zGbnIq_editorModal .zGbnIq_editorScroll {
				scrollbar-width: auto;
				scrollbar-color: auto;
			}
			.zGbnIq_editorModal .zGbnIq_editorScroll:is(:hover,:focus-within) { scrollbar-color: auto; }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar { width: 8px; background: transparent; }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-track { background: transparent; border: 0; box-shadow: none; margin-block: 6px; }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-thumb {
				background: transparent;
				border: 2px solid transparent;
				background-clip: padding-box;
				border-radius: 999px;
				min-height: 36px;
				box-shadow: none;
			}
			.zGbnIq_editorModal .zGbnIq_editorScroll:is(:hover,:focus-within)::-webkit-scrollbar-thumb { background-color: var(--dsw-alias-scrollbar-bg-l2, #bfc2c8); }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-thumb:hover,
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-thumb:active { background-color: var(--dsw-alias-scrollbar-hover-l2, #969ba4); }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-corner { background: transparent; }
		}
		@media (forced-colors: active) {
			.zGbnIq_editorModal .zGbnIq_editorScroll { scrollbar-color: auto; }
			.zGbnIq_editorModal .zGbnIq_editorScroll::-webkit-scrollbar-thumb { background-color: ButtonText; }
		}
		`;
		const keyGroupCss = `
		.zGbnIq_namedKey{display:grid;grid-template-columns:22px minmax(100px,.8fr) minmax(140px,1.5fr) auto;align-items:center;gap:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1);border-radius:10px}
		.zGbnIq_namedKey.dragging{opacity:.5}.zGbnIq_namedKey.drag-over{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}
		.zGbnIq_keyDrag{display:flex;align-items:center;justify-content:center;align-self:stretch;width:22px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:grab;border-radius:4px;font:20px/1 system-ui}
		.zGbnIq_keyDrag:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.zGbnIq_keyDrag:active{cursor:grabbing}.zGbnIq_keyDrag:disabled{cursor:default;opacity:.4}
		.zGbnIq_keyDrag:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
		@media(max-width:600px){.zGbnIq_namedKey{grid-template-columns:22px minmax(0,1fr) auto}.zGbnIq_namedKey>input[type=password]{grid-column:2;grid-row:2}.zGbnIq_namedKey>.zGbnIq_keyDrag{grid-row:1 / span 2}}
		.zGbnIq_section{width:100%;min-width:0;container-type:inline-size;gap:8px}
		.zGbnIq_section>.zGbnIq_title{font-size:20px;font-weight:600;line-height:30px;letter-spacing:-.3px}
		.zGbnIq_heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-top:18px}
		.zGbnIq_heading>.zGbnIq_title,.zGbnIq_heading>.zGbnIq_intro{margin:0}
		.zGbnIq_refreshAll{box-sizing:border-box;flex:none;height:32px;margin:0;padding:0 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 82%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;white-space:nowrap}
		.zGbnIq_refreshAll:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l4)}
		.zGbnIq_refreshAll:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
		.zGbnIq_refreshAll:disabled{opacity:.6;cursor:wait}
		.zGbnIq_refreshAll[data-busy=true] svg{animation:zGbnIq_balanceSpin .7s linear infinite;transform-box:fill-box;transform-origin:center}
		@media(prefers-reduced-motion:reduce){.zGbnIq_refreshAll[data-busy=true] svg{animation:none}}
		.zGbnIq_section>.zGbnIq_intro{font-size:13px;line-height:22px}
		.zGbnIq_rows{gap:0;margin:18px 0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--dsw-alias-label-primary) 2%,transparent)}
		.zGbnIq_rows:empty{display:none}
		.zGbnIq_rows>.zGbnIq_rowCard{border:0;border-radius:0;padding:12px 20px;gap:4px;height:auto;min-height:0;box-sizing:border-box;overflow:hidden;justify-content:center}
		.zGbnIq_rows>.zGbnIq_rowCard+.zGbnIq_rowCard{border-top:1px solid var(--dsw-alias-border-l2)}
		.zGbnIq_rows>.zGbnIq_rowCard:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent)}
		.zGbnIq_rowHead{display:flex;width:100%;box-sizing:border-box;align-items:center;column-gap:14px;min-width:0}
		.zGbnIq_providerAvatar{flex:none;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-label-secondary);font-size:15px;font-weight:600;user-select:none}
		.zGbnIq_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px}
		.zGbnIq_rowIdentity{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden}
		.zGbnIq_rowName{font-size:14px;font-weight:600;line-height:22px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
		.zGbnIq_rowTag{border:0;border-radius:0;padding:0;font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none}
		.zGbnIq_keyGroup{display:flex;align-items:center;gap:7px;min-width:0;min-height:20px}
		.zGbnIq_keyGroup .zGbnIq_credentialDot{width:6px;height:6px;flex:none;background:var(--dsw-alias-label-tertiary)}
		.zGbnIq_keyGroup .zGbnIq_credentialDotConfigured{background:var(--dsw-alias-state-success-primary)}
		.zGbnIq_keyGroup .zGbnIq_credentialDotMissing{background:var(--dsw-alias-state-error-primary)}
		.zGbnIq_keyGroupBadge{min-width:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.zGbnIq_keyGroup .zGbnIq_secondaryButton{flex:none;height:22px;min-width:0;border:0;background:transparent;border-radius:5px;padding:0 5px;font-size:11px;line-height:18px;color:var(--dsw-alias-label-secondary)}
		.zGbnIq_keyGroup .zGbnIq_secondaryButton:hover:not(:disabled){color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
		.zGbnIq_rowActions{flex:none;align-self:center;display:grid;grid-template-columns:56px 32px;gap:8px;margin:0;align-items:center;white-space:nowrap}
		.zGbnIq_rowActions .zGbnIq_secondaryButton{height:32px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 12px;font-size:12px;background:transparent}
		.zGbnIq_rowActions .zGbnIq_dangerButton{height:32px;width:32px;border-radius:8px;padding:0;color:var(--dsw-alias-label-tertiary)}
		.zGbnIq_rowActions .zGbnIq_dangerButton:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
		.zGbnIq_addActions{gap:10px}
		.zGbnIq_addActions .zGbnIq_addButton{flex:0 1 auto;min-width:0;height:36px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 13px;gap:6px;font-size:12px}
		.zGbnIq_addActions .zGbnIq_addButton:first-child{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
		@container(max-width:460px){.zGbnIq_rows>.zGbnIq_rowCard{padding:14px 12px}.zGbnIq_rowHead{column-gap:10px}.zGbnIq_providerAvatar{display:none}.zGbnIq_rowIdentity{gap:6px}}
		.zGbnIq_keyGroupDialog{box-sizing:border-box;width:min(460px,calc(100vw - 32px));max-width:calc(100vw - 32px)}
		.zGbnIq_keyGroupOptions{display:flex;flex-direction:column;gap:6px;max-height:40vh;overflow-y:auto;min-width:0}
		.zGbnIq_keyGroupOption{font:inherit;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:10px 12px;color:var(--dsw-alias-label-primary);background:transparent;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;cursor:pointer}
		.zGbnIq_keyGroupOption>span:first-child{overflow-wrap:anywhere;min-width:0}
		.zGbnIq_keyGroupOption>span:last-child{flex:none;font-size:12px;color:var(--dsw-alias-label-tertiary)}
		.zGbnIq_keyGroupOption:hover:not(:disabled),.zGbnIq_keyGroupOption[aria-current=true]{background:var(--dsw-alias-interactive-bg-hover)}
		.zGbnIq_keyGroupOption:disabled{opacity:.55;cursor:default}
		.zGbnIq_keyGroupOption:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
		/* Balance block: a compact right-aligned stack that sits between the
		   provider identity and the row actions. The age line reads above the
		   amounts, mirroring the reference layout, so the whole block stays
		   vertically centered beside Edit/Delete instead of pushing a third
		   line under the key group. */
		.zGbnIq_balance{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:2px;flex:none;min-width:0;max-width:100%;margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
		.zGbnIq_balanceNumbers{display:inline-flex;align-items:baseline;justify-content:flex-end;flex-wrap:nowrap;gap:2px 12px;min-width:0;white-space:nowrap}
		.zGbnIq_balanceNumbers strong{font-weight:600;color:var(--dsw-alias-label-secondary);margin-left:5px}
		.zGbnIq_balanceNumbers .zGbnIq_balanceOk{color:var(--dsw-alias-state-success-primary)}
		.zGbnIq_balanceNumbers .zGbnIq_balanceRemaining{color:var(--dsw-alias-state-warn-primary)}
		.zGbnIq_balanceNumbers .zGbnIq_balanceLow{color:var(--dsw-alias-state-error-primary)}
		.zGbnIq_balanceNumbers .zGbnIq_balanceUnit{margin-left:4px}
		.zGbnIq_balanceMeta{display:inline-flex;align-items:center;gap:6px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
		.zGbnIq_balanceAge{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
		.zGbnIq_balanceAge svg{flex:none;opacity:.75}
		.zGbnIq_balanceRefresh{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
		.zGbnIq_balanceRefresh:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
		.zGbnIq_balanceRefresh:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
		.zGbnIq_balanceRefresh:disabled{opacity:.7;cursor:wait}
		.zGbnIq_balanceRefresh[data-busy=true] svg,.zGbnIq_balanceRefresh:disabled svg{animation:zGbnIq_balanceSpin .7s linear infinite;transform-box:fill-box;transform-origin:center}
		@keyframes zGbnIq_balanceSpin{to{transform:rotate(360deg)}}
		@media(prefers-reduced-motion:reduce){.zGbnIq_balanceRefresh[data-busy=true] svg,.zGbnIq_balanceRefresh:disabled svg{animation:none}}
		.zGbnIq_queryDialog.zGbnIq_queryDialog{width:min(660px,calc(100vw - 32px));max-width:660px;max-height:calc(100dvh - 40px);overflow-y:auto}
		.zGbnIq_queryForm{display:flex;flex-direction:column;gap:16px;padding:4px 0}
		.zGbnIq_queryGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
		.zGbnIq_queryForm .zGbnIq_input{max-width:none;min-width:0;border-color:var(--dsw-alias-border-l3)}
		.zGbnIq_queryForm .zGbnIq_input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.8}
		.zGbnIq_queryEntry{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
		.zGbnIq_queryResult{padding:10px 12px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-size:12px;white-space:pre-wrap}
		.zGbnIq_spendHistory{margin-top:4px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l3);display:flex;flex-direction:column;gap:12px}
		.zGbnIq_spendToday{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
		.zGbnIq_spendToday strong{font-size:20px;font-weight:600}
		.zGbnIq_spendChartWrap{display:flex;flex-direction:column;gap:12px;min-width:0}
		.zGbnIq_spendChart{width:100%;height:176px;display:block}
		.zGbnIq_spendTable{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
		.zGbnIq_spendTableRow{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-size:11px;line-height:16px;text-align:center}
		.zGbnIq_spendTableRow[data-today=true]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-layer-1))}
		.zGbnIq_spendTableRow span:last-child{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
		@media(max-width:620px){.zGbnIq_spendTable{grid-template-columns:repeat(4,minmax(0,1fr))}}
		.zGbnIq_keySelect{position:relative;min-width:0;flex:1}
		.zGbnIq_keySelectButton{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;height:38px;padding:0 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
		.zGbnIq_keySelectButton:hover:not(:disabled),.zGbnIq_keySelectButton[aria-expanded=true]{border-color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}
		.zGbnIq_keySelectButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
		.zGbnIq_keySelectMenu{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 5px);display:flex;flex-direction:column;gap:2px;padding:5px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 12px 30px rgb(0 0 0 / 30%)}
		.zGbnIq_keySelectOption{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:34px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:left;cursor:pointer}
		.zGbnIq_keySelectOption:hover,.zGbnIq_keySelectOption[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover-solid)}
		.zGbnIq_keySelectOption[aria-selected=true]:after{content:"✓";color:var(--dsw-alias-state-success-primary);font-weight:600}
		@media(max-width:520px){.zGbnIq_queryGrid{grid-template-columns:minmax(0,1fr)}}
		.zGbnIq_balance[data-stale=true] .zGbnIq_balanceNumbers{opacity:.55}
		/* Only wrap on very narrow cards; the settings pane itself is already
		   ~560px, so a higher breakpoint would always dump the block under. */
		@container(max-width:400px){.zGbnIq_rowHead{flex-wrap:wrap}.zGbnIq_balance{order:3;width:100%;align-items:flex-start;margin-top:2px}.zGbnIq_balanceNumbers{justify-content:flex-start}}
		/* Calm editor surface: hierarchy comes from spacing and type, with only
		   restrained field fills instead of a stack of visible boxes. */
		.zGbnIq_editorModal{background:var(--dsw-alias-bg-module-platform)!important;border-radius:18px!important;box-shadow:0 24px 70px rgb(0 0 0 / 28%)}
		.zGbnIq_editorModal>div:first-child{padding:22px 28px 14px!important;border-bottom:0!important}
		.zGbnIq_editorModal>div:first-child>div:last-child{padding:0 28px 14px!important;overflow:hidden}
		.zGbnIq_editor{background:transparent;border-radius:0;padding:0;gap:22px}
		.zGbnIq_editorHeader{padding-bottom:2px;gap:9px}
		.zGbnIq_editorTitle{font-size:18px;font-weight:600;line-height:26px}
		.zGbnIq_editorRoute{font-size:11px;opacity:.7}
		.zGbnIq_field{gap:7px}
		.zGbnIq_fieldLabel{font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary);letter-spacing:.02em}
		.zGbnIq_input{height:38px;border:1px solid transparent;border-radius:9px;background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l4);padding:0 12px}
		.zGbnIq_input:hover{box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l3)}
		.zGbnIq_input:focus{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary),0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
		.zGbnIq_customized{border-top:0;padding-top:0}
		.zGbnIq_customizedSummary{margin:0 -4px;padding:5px 4px;font-size:13px;color:var(--dsw-alias-label-secondary)}
		.zGbnIq_customizedBody{gap:20px;padding-top:8px}
		.zGbnIq_modelCatalog{border-top:0;gap:12px;padding-top:0}
		.zGbnIq_modelCatalogHeading{gap:1px}
		.zGbnIq_modelCatalogTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary)}
		.zGbnIq_modelCatalogMeta{font-size:11px}
		.zGbnIq_modelEntry{border:0;border-radius:9px;padding:10px;background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l4)}
		.zGbnIq_modelRow{gap:8px}
		.zGbnIq_modelEntry .zGbnIq_input:not([type=checkbox]){background:var(--dsw-alias-bg-layer-1);border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 38%,transparent);box-shadow:none;border-radius:7px;color:var(--dsw-alias-label-primary)}
		.zGbnIq_editor .zGbnIq_input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.85}
		.zGbnIq_modelEntry .zGbnIq_modelFieldLabel{color:var(--dsw-alias-label-secondary)}
		.zGbnIq_modelEntry .zGbnIq_input:not([type=checkbox]):hover:not(:disabled){border-color:color-mix(in srgb,var(--dsw-alias-label-primary) 55%,transparent)}
		.zGbnIq_modelEntry .zGbnIq_input:focus-visible{border-color:var(--dsw-alias-label-primary);outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px;box-shadow:none}
		.zGbnIq_modelAdvanced{align-items:end;gap:12px;padding-top:14px}
		.zGbnIq_modelField.zGbnIq_imageField{flex-direction:row;align-items:center;justify-content:space-between;gap:12px;min-width:0;min-height:38px;padding:0 4px 0 8px}
		.zGbnIq_imageField .zGbnIq_modelFieldLabel{line-height:20px}
		.zGbnIq_modelEntry input.zGbnIq_input[type=checkbox]{appearance:none;box-sizing:border-box;flex:0 0 20px;width:20px;height:20px;margin:0;padding:0;border:1px solid var(--dsw-alias-label-secondary);border-radius:4px;box-shadow:none;background:var(--dsw-alias-bg-layer-1);cursor:pointer;display:grid;place-content:center}
		.zGbnIq_modelEntry input.zGbnIq_input[type=checkbox]:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
		.zGbnIq_modelEntry input.zGbnIq_input[type=checkbox]:checked:after{content:"";width:9px;height:5px;border-left:2px solid var(--dsw-alias-bg-layer-1);border-bottom:2px solid var(--dsw-alias-bg-layer-1);transform:translateY(-1px) rotate(-45deg)}
		@media(forced-colors:active){.zGbnIq_modelEntry input.zGbnIq_input[type=checkbox]{appearance:auto}.zGbnIq_modelEntry input.zGbnIq_input[type=checkbox]:after{display:none}}
		.zGbnIq_keyGroupOption{border-color:var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-1)}
		.zGbnIq_editorActions{padding-top:4px;gap:9px}
		.zGbnIq_editorActions .zGbnIq_secondaryButton,.zGbnIq_editorActions .zGbnIq_primaryButton{height:34px;border-radius:8px;padding:0 17px;font-size:13px}
		.zGbnIq_editorActions .zGbnIq_primaryButton{box-shadow:0 2px 6px rgb(0 0 0 / 14%)}
		.zGbnIq_editorTabs{display:flex;gap:10px;margin:6px 0 4px}
		.zGbnIq_editorTab{box-sizing:border-box;flex:1;min-width:0;height:40px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:15px;font-weight:600;cursor:pointer}
		.zGbnIq_editorTab:hover:not([aria-selected=true]){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
		.zGbnIq_editorTab[aria-selected=true]{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-secondary)}
		.zGbnIq_editorTab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}

		.zGbnIq_modelKeyGroups{display:flex;flex-direction:column;gap:20px;min-width:0}
		.zGbnIq_modelKeySection{min-width:0}
		.zGbnIq_modelKeyHeading{display:flex;align-items:center;gap:8px;min-width:0;margin-bottom:9px;padding:0 2px}
		.zGbnIq_modelKeyName{min-width:0;font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.zGbnIq_modelKeyCount{flex:none;min-width:18px;padding:1px 5px;box-sizing:border-box;border-radius:5px;font-size:11px;text-align:center;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}
		.zGbnIq_modelKeyHeading .zGbnIq_linkButton{margin-left:auto;flex:none}
		.zGbnIq_modelKeyEmpty{margin:0;padding:10px 12px;border:1px dashed var(--dsw-alias-border-l3);border-radius:8px;color:var(--dsw-alias-label-tertiary);font-size:12px}
		.zGbnIq_modelKeySection + .zGbnIq_modelKeySection{padding-top:15px;border-top:1px solid var(--dsw-alias-border-l4)}
		.zGbnIq_modelChip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
		.zGbnIq_modelList{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch}
		.zGbnIq_modelChip{display:flex;align-items:center;gap:4px;min-width:0;min-height:36px;padding:6px 4px 6px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l4);cursor:grab}
		.zGbnIq_modelChip:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,var(--dsw-alias-bg-layer-1))}
		.zGbnIq_modelChip:active,.zGbnIq_modelChipDragging{cursor:grabbing}
		.zGbnIq_modelChipDragging{opacity:.5}
		.zGbnIq_modelChipTitle{flex:1;min-width:0;font-size:12px;font-weight:600;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.zGbnIq_modelChip .zGbnIq_iconButton{width:26px;height:26px;flex:none;cursor:pointer}
		.zGbnIq_modelEditDialog.zGbnIq_modelEditDialog{width:min(440px,calc(100vw - 48px))!important;max-width:440px!important;height:auto!important;max-height:min(720px,calc(100dvh - 48px))!important}
		.zGbnIq_modelEditDialog>div{width:100%;max-width:100%;min-width:0;box-sizing:border-box}
		.zGbnIq_modelEditForm{display:flex;flex-direction:column;align-items:stretch;gap:14px;width:100%;min-width:0;padding:4px 0 8px}
		.zGbnIq_modelEditForm .zGbnIq_modelField{display:flex;flex-direction:column;align-items:stretch;gap:6px;width:100%;min-width:0}
		.zGbnIq_modelEditForm .zGbnIq_input:not([type=checkbox]),.zGbnIq_modelEditForm .zGbnIq_keySelect,.zGbnIq_modelEditForm .zGbnIq_keySelectButton{width:100%;max-width:100%;box-sizing:border-box}
		.zGbnIq_modelEditForm .zGbnIq_imageField{flex-direction:row;align-items:center;justify-content:space-between;gap:12px;min-height:32px;padding:0}
		.zGbnIq_modelEditForm .zGbnIq_imageField .zGbnIq_modelFieldLabel{flex:1;min-width:0;white-space:nowrap;line-height:20px}
		.zGbnIq_modelEditForm input.zGbnIq_input[type=checkbox]{appearance:none;box-sizing:border-box;flex:none;width:18px;height:18px;margin:0;padding:0;border:1px solid var(--dsw-alias-label-secondary);border-radius:4px;box-shadow:none;background:var(--dsw-alias-bg-layer-1);cursor:pointer;display:grid;place-content:center}
		.zGbnIq_modelEditForm input.zGbnIq_input[type=checkbox]:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
		.zGbnIq_modelEditForm input.zGbnIq_input[type=checkbox]:checked:after{content:"";width:9px;height:5px;border-left:2px solid var(--dsw-alias-bg-layer-1);border-bottom:2px solid var(--dsw-alias-bg-layer-1);transform:translateY(-1px) rotate(-45deg)}
		@media(forced-colors:active){.zGbnIq_modelEditForm input.zGbnIq_input[type=checkbox]{appearance:auto}.zGbnIq_modelEditForm input.zGbnIq_input[type=checkbox]:after{display:none}}
		.zGbnIq_modelListHead{flex-wrap:wrap;align-items:flex-end}
		.zGbnIq_addModelDialog{width:min(540px,calc(100vw - 32px));max-width:540px}
		.zGbnIq_addModelKey{display:flex;gap:12px;align-items:center;padding:10px 12px;margin-bottom:14px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:12px}
		.zGbnIq_addModelKey>span{color:var(--dsw-alias-label-tertiary);flex:none}
		.zGbnIq_addModelKey>strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
		.zGbnIq_addModelModes{display:flex;gap:4px;padding:4px;margin-bottom:18px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3)}
		.zGbnIq_addModelModes>button{flex:1;min-width:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;padding:9px 6px;cursor:pointer}
		.zGbnIq_addModelModes>button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);box-shadow:0 1px 3px #0002}
		.zGbnIq_addModelModes>button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
		.zGbnIq_addModelFetch{display:flex;align-items:center;flex-wrap:wrap;gap:10px;justify-content:space-between;margin-bottom:14px}
		.zGbnIq_addModelFetch>span{flex:1;min-width:160px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-tertiary)}
		.zGbnIq_addModelDialog .zGbnIq_error{grid-column:1/-1;overflow-wrap:anywhere}
		.zGbnIq_candidateToolbar{align-items:flex-end;flex-wrap:wrap}
		.zGbnIq_candidateToolbar .zGbnIq_candidateSearch{flex:1;min-width:140px}
		@media(max-width:860px){.zGbnIq_modelList{grid-template-columns:repeat(2,minmax(0,1fr))}}
		@media(max-width:620px){.zGbnIq_editorModal>div:first-child{padding-left:18px!important;padding-right:18px!important}.zGbnIq_editorModal>div:first-child>div:last-child{padding-left:18px!important;padding-right:18px!important;padding-bottom:14px!important}.zGbnIq_modelRow{grid-template-columns:minmax(0,1fr) auto}.zGbnIq_modelRow>*:nth-child(2){grid-column:1 / -1}.zGbnIq_modelList{grid-template-columns:minmax(0,1fr)}}
		`;
		const tagId$3 = "@deepseek-ai/dsh-client-ui-settings-models/ModelsSection.module.css";
		if (typeof document !== "undefined") {
			const styleText = css$3 + editorDialogCss + editorScrollCss + keyGroupCss;
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-models";
				tag.dataset.pluginCss = tagId$3;
				document.head.appendChild(tag);
			}
			if (tag.textContent !== styleText) tag.textContent = styleText;
		}
		var ModelsSection_module_css_default = {
			"addActions": "zGbnIq_addActions",
			"addBlock": "zGbnIq_addBlock",
			"addButton": "zGbnIq_addButton",
			"addCard": "zGbnIq_addCard",
			"addModelButton": "zGbnIq_addModelButton",
			"addModes": "zGbnIq_addModes",
			"addPanel": "zGbnIq_addPanel",
			"advancedHint": "zGbnIq_advancedHint",
			"candidate": "zGbnIq_candidate",
			"candidateEmpty": "zGbnIq_candidateEmpty",
			"candidateId": "zGbnIq_candidateId",
			"candidateLabel": "zGbnIq_candidateLabel",
			"candidateList": "zGbnIq_candidateList",
			"candidateSearch": "zGbnIq_candidateSearch",
			"candidateToolbar": "zGbnIq_candidateToolbar",
			"credentialDot": "zGbnIq_credentialDot",
			"credentialDotConfigured": "zGbnIq_credentialDotConfigured",
			"credentialDotMissing": "zGbnIq_credentialDotMissing",
			"customized": "zGbnIq_customized",
			"customizedBody": "zGbnIq_customizedBody",
			"customizedSummary": "zGbnIq_customizedSummary",
			"dangerButton": "zGbnIq_dangerButton",
			"deleteConfirm": "zGbnIq_deleteConfirm",
			"deleteDialog": "zGbnIq_deleteDialog",
			"editor": "zGbnIq_editor",
			"editorModal": "zGbnIq_editorModal",
			"editorActions": "zGbnIq_editorActions",
			"editorHeader": "zGbnIq_editorHeader",
			"editorRoute": "zGbnIq_editorRoute",
			"editorTabs": "zGbnIq_editorTabs",
			"editorTab": "zGbnIq_editorTab",
			"editorTitle": "zGbnIq_editorTitle",
			"error": "zGbnIq_error",
			"fetchDialog": "zGbnIq_fetchDialog",
			"field": "zGbnIq_field",
			"fieldLabel": "zGbnIq_fieldLabel",
			"hiddenLabel": "zGbnIq_hiddenLabel",
			"iconButton": "zGbnIq_iconButton",
			"iconButtonDanger": "zGbnIq_iconButtonDanger",
			"input": "zGbnIq_input",
			"intro": "zGbnIq_intro",
			"linkButton": "zGbnIq_linkButton",
			"modelAdvanced": "zGbnIq_modelAdvanced",
			"modelCatalog": "zGbnIq_modelCatalog",
			"modelCatalogHeading": "zGbnIq_modelCatalogHeading",
			"modelCatalogMeta": "zGbnIq_modelCatalogMeta",
			"modelCatalogTitle": "zGbnIq_modelCatalogTitle",
			"modelChip": "zGbnIq_modelChip",
			"modelChipBody": "zGbnIq_modelChipBody",
			"modelChipDragging": "zGbnIq_modelChipDragging",
			"modelChipMeta": "zGbnIq_modelChipMeta",
			"modelChipTitle": "zGbnIq_modelChipTitle",
			"modelEditDialog": "zGbnIq_modelEditDialog",
			"modelEditForm": "zGbnIq_modelEditForm",
			"modelEmpty": "zGbnIq_modelEmpty",
			"modelEntry": "zGbnIq_modelEntry",
			"modelHandle": "zGbnIq_modelHandle",
			"modelField": "zGbnIq_modelField",
			"modelFieldLabel": "zGbnIq_modelFieldLabel",
			"modelInputChoices": "zGbnIq_modelInputChoices",
			"modelInputTypes": "zGbnIq_modelInputTypes",
			"modelList": "zGbnIq_modelList",
			"modelListHead": "zGbnIq_modelListHead",
			"modelRow": "zGbnIq_modelRow",
			"notice": "zGbnIq_notice",
			"primaryButton": "zGbnIq_primaryButton",
			"rowActions": "zGbnIq_rowActions",
			"rowCard": "zGbnIq_rowCard",
			"rowHead": "zGbnIq_rowHead",
			"rowIdentity": "zGbnIq_rowIdentity",
			"rowName": "zGbnIq_rowName",
			"rowTag": "zGbnIq_rowTag",
			"rows": "zGbnIq_rows",
			"savedNotice": "zGbnIq_savedNotice",
			"secondaryButton": "zGbnIq_secondaryButton",
			"section": "zGbnIq_section",
			"selectInput": "zGbnIq_selectInput",
			"setupCard": "zGbnIq_setupCard",
			"switchThumb": "zGbnIq_switchThumb",
			"title": "zGbnIq_title"
		};
		//#endregion
		//#region lib/types/client/EditorFooter.js
		/**
		* Render one provider card's action row.
		* @param props - the labels, commit gating, and handlers the owning card supplies.
		* @returns the cancel/commit row.
		*/
		function EditorFooter(props) {
			const { t } = props;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["editorActions"],
				children: [(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ModelsSection_module_css_default["secondaryButton"],
					disabled: props.busy,
					onClick: props.onCancel,
					children: t(props.cancelLabelKey ?? "cancel")
				}), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ModelsSection_module_css_default["primaryButton"],
					disabled: props.submitDisabled,
					onClick: props.onSubmit,
					children: props.busy ? t(props.submitBusyLabelKey) : t(props.submitLabelKey)
				})]
			});
		}
		//#endregion
		//#region lib/types/client/ModelInputTypes.js
		/**
		* Edit a nonempty set of input types, displaying inherited types before an override exists.
		* @param props - model declaration and row replacement action.
		* @returns the labeled text and image checkboxes.
		*/
		function ModelInputTypes({ model, field, position, disabled, fallback, t, onChange }) {
			const modalities = model[field];
			const selected = Array.isArray(modalities) && modalities.length > 0 ? modalities : fallback ?? ["text"];
			return (0, react_jsx_runtime.jsxs)("fieldset", {
				className: ModelsSection_module_css_default["modelInputTypes"],
				"aria-label": `${t("modelInputTypes")} ${String(position)}`,
				children: [(0, react_jsx_runtime.jsx)("legend", {
					className: ModelsSection_module_css_default["modelFieldLabel"],
					children: t("modelInputTypes")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: ModelsSection_module_css_default["modelInputChoices"],
					children: ["text", "image"].map((modality) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
						label: t(modality === "text" ? "modelInputText" : "modelInputImage"),
						checked: selected.includes(modality),
						disabled: disabled || selected.length === 1 && selected.includes(modality),
						onChange: (checked) => {
							const nextSelected = ["text", "image"].filter((value) => value === modality ? checked : selected.includes(value));
							const next = {
								...model,
								[field]: nextSelected
							};
							if (field === "inputModalities" && !nextSelected.includes("image")) {
								Reflect.deleteProperty(next, "imagePixelBudget");
								Reflect.deleteProperty(next, "imageMaxBytes");
							}
							onChange(next);
						}
					}, modality))
				})]
			});
		}
		//#endregion
		//#region lib/types/client/ModelRow.js
		/**
		* Render consistent model identity, capacity, and input-type controls.
		* @param props - drafted fields and their owning editor's actions.
		* @returns one expandable model entry.
		*/
		function ModelRow(props) {
			const { model, position, t, disabled } = props;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["modelEntry"],
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelRow"],
					children: [
						["id", "name"].map((field) => (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: typeof model[field] === "string" ? model[field] : "",
							placeholder: t(field === "id" ? "modelId" : "modelName"),
							"aria-label": `${t(field === "id" ? "modelId" : "modelName")} ${String(position)}`,
							disabled,
							onChange: (event) => {
								const value = event.target.value;
								props.onFieldChange(field, field === "name" && value === "" ? void 0 : value);
							},
							onBlur: field === "id" ? (event) => props.onIdBlur?.(event.target.value) : void 0
						}, field)),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ModelsSection_module_css_default["iconButton"],
							"aria-label": `${t("modelAdvanced")} ${String(position)}`,
							"aria-expanded": props.expanded,
							title: t("modelAdvanced"),
							onClick: props.onToggle,
							children: props.expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
							"aria-label": `${t("removeModel")} ${String(position)}`,
							title: t("removeModel"),
							disabled,
							onClick: props.onRemove,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
						})
					]
				}), props.expanded ? (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelAdvanced"],
					children: [["contextWindow", "maxTokens"].map((field) => (0, react_jsx_runtime.jsxs)("label", {
						className: ModelsSection_module_css_default["modelField"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelFieldLabel"],
							children: t(field)
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							inputMode: "numeric",
							value: props[field].value,
							placeholder: props[field].placeholder,
							"aria-label": `${t(field)} ${String(position)}`,
							disabled,
							onChange: (event) => {
								props[field].onChange(event.target.value);
							},
							onBlur: props[field].onBlur
						})]
					}, field)), (0, react_jsx_runtime.jsx)(ModelInputTypes, {
						model,
						field: props.inputField,
						position,
						fallback: props.inputFallback,
						disabled: disabled || props.inputLoading === true,
						t,
						onChange: props.onChange
					})]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/DeepSeekModelsEditor.js
		/**
		* Curated editor for the direct DeepSeek adapter's advisory model catalog.
		* The settings layer replaces `models` as one array, so the parent supplies
		* the effective inherited rows until the first edit materializes a user
		* override; reset removes that override instead of copying defaults into it.
		*/
		/** Row index encoded in an editing-buffer key. */
		function rowOf(key) {
			return Number(key.slice(0, key.indexOf(":")));
		}
		/** Accepted capacity spellings: a decimal count with an optional K/M suffix. */
		const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
		/** Decimal suffix scales — `1M` is 1000K, matching how model capacities are quoted. */
		const CAPACITY_SCALE = {
			k: 1e3,
			m: 1e6
		};
		/**
		* Read a typed capacity, so a user can write `256K` or `1M` instead of counting
		* zeroes. The stored value stays a plain token count.
		* @param text - raw field text.
		* @returns the count; `undefined` when blank (inherit), `NaN` when unreadable
		* (rejected by {@link validateDeepSeekModels} before any write).
		*/
		function parseCapacity(text) {
			const trimmed = text.trim();
			if (trimmed.length === 0) return void 0;
			const match = CAPACITY_PATTERN.exec(trimmed);
			if (match === null) return NaN;
			const suffix = match[2]?.toLowerCase();
			const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
			const scaled = Number(match[1]) * scale;
			const rounded = Math.round(scaled);
			return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
		}
		/**
		* Spell a stored count back in the shortest form that survives a round trip
		* through {@link parseCapacity}; a count that is not a whole number of
		* thousands stays written out.
		* @param value - stored capacity.
		* @returns the field text.
		*/
		function formatCapacity(value) {
			if (!Number.isInteger(value) || value <= 0) return String(value);
			if (value % CAPACITY_SCALE.m === 0) return `${String(value / CAPACITY_SCALE.m)}M`;
			if (value % CAPACITY_SCALE.k === 0) return `${String(value / CAPACITY_SCALE.k)}K`;
			return String(value);
		}
		/** Convert a schema-validated catalog value into records without dropping hidden fields. */
		function modelDrafts(value) {
			if (!Array.isArray(value)) return [];
			return value.map((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry) ? entry : {});
		}
		/**
		* Validate adapter constraints that the serialized schema cannot express.
		* @param value - user-owned `models` value, or undefined while inherited.
		* @returns the first invalid row, or undefined when the adapter will accept it.
		*/
		function validateDeepSeekModels(value) {
			if (value === void 0) return void 0;
			const models = modelDrafts(value);
			for (const [index, model] of models.entries()) {
				const id = model["id"];
				const trimmed = typeof id === "string" ? id.trim() : void 0;
				if (trimmed === void 0 || trimmed.length === 0) return {
					index,
					key: "modelIdRequired"
				};
				const name = model["name"];
				if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return {
					index,
					key: "modelNameInvalid"
				};
				const contextWindow = model["contextWindow"];
				if (contextWindow !== void 0 && (typeof contextWindow !== "number" || !Number.isInteger(contextWindow) || contextWindow <= 0)) return {
					index,
					key: "modelContextInvalid"
				};
				const maxTokens = model["maxTokens"];
				if (maxTokens !== void 0 && (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens <= 0)) return {
					index,
					key: "modelMaxTokensInvalid"
				};
			}
		}
		/**
		 * Model ids are the local selector identity. When one upstream model is
		 * bound to more than one named key, retain the first id and give later rows
		 * a stable local alias while keeping `upstreamModelId` for the wire request.
		 */
		function prepareModelEntries(value) {
			if (!Array.isArray(value)) return value;
			const used = new Set();
			return value.map((entry, index) => {
				const copy = { ...entry };
				const original = typeof copy.id === "string" ? copy.id.trim() : "";
				if (!original || !used.has(original)) {
					if (original) used.add(original);
					if (copy.id !== original) copy.id = original;
					return copy;
				}
				const keyPart = typeof copy.apiKey === "string" && copy.apiKey.length > 0 ? copy.apiKey : `copy-${index + 1}`;
				const suffix = keyPart.replace(/[^A-Za-z0-9._~-]+/g, "-").replace(/^-+|-+$/g, "") || `copy-${index + 1}`;
				const wireId = typeof copy.upstreamModelId === "string" && copy.upstreamModelId.length > 0 ? copy.upstreamModelId : original;
				let alias = `${original}#${suffix}`;
				let attempt = 2;
				while (used.has(alias)) alias = `${original}#${suffix}-${attempt++}`;
				copy.id = alias;
				copy.upstreamModelId = wireId;
				used.add(alias);
				return copy;
			});
		}
		/**
		* Render the direct DeepSeek adapter's model catalog: id and display name on
		* each row, capacities and input types behind the row's own disclosure.
		* @param props - effective rows plus the array-level override actions.
		* @returns the catalog editor.
		*/
		function DeepSeekModelsEditor(props) {
			const [editing, setEditing] = (0, react.useState)(() => /* @__PURE__ */ new Map());
			const [editingIndex, setEditingIndex] = (0, react.useState)(void 0);
			const [dragIndex, setDragIndex] = (0, react.useState)(void 0);
			const update = (index, key, value) => {
				const next = props.models.map((model, at) => {
					const copy = { ...model };
					if (at !== index) return copy;
					if (value === void 0) Reflect.deleteProperty(copy, key);
					else copy[key] = value;
					return copy;
				});
				props.onChange(next);
			};
			const remove = (index) => {
				setEditing((current) => {
					const next = /* @__PURE__ */ new Map();
					for (const [key, text] of current) {
						const at = rowOf(key);
						if (at === index) continue;
						next.set(at > index ? key.replace(/^\d+/, String(at - 1)) : key, text);
					}
					return next;
				});
				setEditingIndex((current) => current === void 0 ? current : current === index ? void 0 : current > index ? current - 1 : current);
				props.onChange(props.models.filter((_model, at) => at !== index).map((model) => ({ ...model })));
			};
			const moveModel = (from, to) => {
				if (from === to || from < 0 || to < 0 || from >= props.models.length || to >= props.models.length) return;
				const next = props.models.map((model) => ({ ...model }));
				const [item] = next.splice(from, 1);
				next.splice(to, 0, item);
				props.onChange(next);
				setEditing((current) => {
					const shifted = /* @__PURE__ */ new Map();
					for (const [key, value] of current) {
						const at = rowOf(key);
						let dest = at;
						if (at === from) dest = to;
						else if (from < to && at > from && at <= to) dest = at - 1;
						else if (from > to && at >= to && at < from) dest = at + 1;
						shifted.set(key.replace(/^\d+/, String(dest)), value);
					}
					return shifted;
				});
				setEditingIndex((current) => {
					if (current === void 0) return current;
					if (current === from) return to;
					if (from < to && current > from && current <= to) return current - 1;
					if (from > to && current >= to && current < from) return current + 1;
					return current;
				});
			};
			/** The field's text: its live keystrokes, else the stored count spelled short. */
			const capacityText = (model, index, field) => {
				const typed = editing.get(`${String(index)}:${field}`);
				if (typed !== void 0) return typed;
				const value = model[field];
				return typeof value === "number" ? formatCapacity(value) : "";
			};
			const settleCapacity = (index, field) => {
				const key = `${String(index)}:${field}`;
				const typed = editing.get(key);
				if (typed === void 0) return;
				const parsed = parseCapacity(typed);
				if (parsed !== void 0 && Number.isNaN(parsed)) return;
				setEditing((current) => {
					const next = new Map(current);
					next.delete(key);
					return next;
				});
			};
			const capacityInput = (model, index, field, fallback) => ({
				value: capacityText(model, index, field),
				placeholder: fallback === void 0 ? props.t(field === "contextWindow" ? "contextWindowPlaceholder" : "maxTokensPlaceholder") : formatCapacity(fallback),
				onChange: (text) => {
					setEditing((current) => new Map(current).set(`${String(index)}:${field}`, text));
					update(index, field, parseCapacity(text));
				},
				onBlur: () => {
					settleCapacity(index, field);
				}
			});
            const capacityField = (model, index, field, fallback) => {
                const input = capacityInput(model, index, field, fallback);
                return react.createElement("label", { className: ModelsSection_module_css_default.modelField },
                    react.createElement("span", { className: ModelsSection_module_css_default.modelFieldLabel }, props.t(field)),
                    react.createElement("input", { className: ModelsSection_module_css_default.input, type: "text", disabled: props.disabled,
                        ...input, onChange: event => input.onChange(event.target.value) }));
            };
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ModelsSection_module_css_default["modelCatalog"],
				"aria-label": props.t("models"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelListHead"],
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["modelCatalogHeading"],
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["modelCatalogTitle"],
								children: props.t("models")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["modelCatalogMeta"],
								children: props.overridden ? props.t("modelsCustomized") : props.t("modelsInherited")
							})]
						})]
					}),
					props.models.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["modelEmpty"],
						children: props.t("modelsEmpty")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: ModelsSection_module_css_default["modelList"],
						children: props.models.map((model, index) => {
							const modelId = typeof model["id"] === "string" ? model["id"] : "";
							const modelName = typeof model["name"] === "string" ? model["name"] : "";
							const title = modelName || modelId || props.t("model");
							return (0, react_jsx_runtime.jsxs)("div", {
								className: `${ModelsSection_module_css_default["modelChip"]}${dragIndex === index ? ` ${ModelsSection_module_css_default["modelChipDragging"]}` : ""}`,
								draggable: !props.disabled,
								onDragOver: (event) => {
									if (props.disabled || dragIndex === void 0) return;
									event.preventDefault();
								},
								onDrop: (event) => {
									event.preventDefault();
									if (dragIndex === void 0) return;
									moveModel(dragIndex, index);
									setDragIndex(void 0);
								},
								onDragStart: (event) => {
									if (props.disabled || event.target.closest?.("button")) {
										event.preventDefault();
										return;
									}
									setDragIndex(index);
									event.dataTransfer.effectAllowed = "move";
									event.dataTransfer.setData("text/plain", String(index));
								},
								onDragEnd: () => setDragIndex(void 0),
								onDoubleClick: () => {
									if (props.disabled) return;
									setEditingIndex(index);
								},
								title: `${props.t("modelEditHint")} · ${props.t("modelReorder")}`,
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelChipTitle"], children: title }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
										"aria-label": `${props.t("removeModel")} ${String(index + 1)}`,
										title: props.t("removeModel"),
										disabled: props.disabled,
										onClick: (event) => {
											event.stopPropagation();
											remove(index);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
									})
								]
							}, `${modelId || "model"}-${index}`);
						})
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addModelButton"],
						disabled: props.disabled,
						onClick: () => {
							props.onChange([...props.models.map((model) => ({ ...model })), { id: "", input: ["text", "image"] }]);
							setEditingIndex(props.models.length);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), props.t("addModel")]
					}),
					editingIndex !== void 0 && props.models[editingIndex] !== void 0 ? (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: true,
						onClose: () => setEditingIndex(void 0),
						title: (typeof props.models[editingIndex]["name"] === "string" && props.models[editingIndex]["name"]) || (typeof props.models[editingIndex]["id"] === "string" && props.models[editingIndex]["id"]) || props.t("model"),
						closeLabel: props.t("close"),
						className: ModelsSection_module_css_default["modelEditDialog"],
						footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: () => setEditingIndex(void 0),
							children: props.t("done")
						}),
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["modelEditForm"],
							children: [
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: props.t("modelId") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: typeof props.models[editingIndex]["id"] === "string" ? props.models[editingIndex]["id"] : "",
										placeholder: props.t("modelId"),
										disabled: props.disabled,
										onChange: (event) => update(editingIndex, "id", event.target.value),
										onBlur: (event) => {
											const trimmed = event.target.value.trim();
											if (trimmed !== event.target.value) update(editingIndex, "id", trimmed);
										}
									})]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: props.t("modelName") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: typeof props.models[editingIndex]["name"] === "string" ? props.models[editingIndex]["name"] : "",
										placeholder: props.t("modelNamePlaceholder"),
										disabled: props.disabled,
										onChange: (event) => update(editingIndex, "name", event.target.value === "" ? void 0 : event.target.value)
									})]
								}),
								capacityField(props.models[editingIndex], editingIndex, "contextWindow", props.defaultContextWindow),
								capacityField(props.models[editingIndex], editingIndex, "maxTokens", props.defaultMaxTokens),
								(0, react_jsx_runtime.jsxs)("label", {
									className: `${ModelsSection_module_css_default["modelField"]} zGbnIq_imageField`,
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: props.t("modelImageInput") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "checkbox",
										checked: ["input", "inputModalities"].some((field) => Array.isArray(props.models[editingIndex][field]) && props.models[editingIndex][field].includes("image")),
										disabled: props.disabled,
										onChange: (event) => update(editingIndex, "input", event.target.checked ? ["text", "image"] : ["text"])
									})]
								})
							]
						})
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/ModelListEditor.js
		/**
		* The model list of one pi-ai provider profile, plus the action that asks the
		* provider what it serves.
		*
		* The list is the profile's `models` array as the card holds it: an empty list
		* means "serve this route's built-in catalog", and any entry replaces that
		* catalog, so a row is only ever added deliberately. Fetching asks the endpoint
		* **the form currently shows** — including a key typed but not yet saved — so
		* adding a provider is one pass instead of save-then-return; the reply is
		* candidates the user picks from, never configuration written behind them.
		*
		* A provider that cannot be interrogated (an unreachable endpoint, a protocol
		* with no readable listing) is not a dead end: the failure is shown next to the
		* rows the user can still fill in by hand.
		*/
		/** A row's text field, or the empty string when unset or not a string. */
		function textOf(model, key) {
			const value = model[key];
			return typeof value === "string" ? value : "";
		}
		/** A row's numeric field, or `undefined` when unset or not a number. */
		function numberOf(model, key) {
			const value = model[key];
			return typeof value === "number" ? value : void 0;
		}
		/**
		* What an empty capacity field is worth, shown as its placeholder so a row left
		* blank does not read as a model with no capacity at all.
		*
		* The magnitudes are the adapter's own route-level fallbacks (`llm-pi-ai`'s
		* `defaultContextWindow` and `defaultMaxTokens`), spelled the way a person
		* would say them. They are a hint, not a mirror: this page counts `K` as 1000,
		* so typing `256K` stores 256000 while leaving the field blank keeps the
		* adapter's 262144. A deployment that overrides those defaults is not
		* reflected here — nothing on this page can read them.
		*/
		const CAPACITY_HINT = {
			contextWindow: "256K",
			maxTokens: "32K"
		};
		/**
		* Spell a stored count for a field that may be unset. The spelling itself is
		* {@link formatCapacity}, shared with the DeepSeek catalog editor so both
		* surfaces read and write one K/M vocabulary.
		* @param value - stored capacity, or `undefined` for an unset field.
		* @returns the field text, empty when unset.
		*/
		function capacitySpelling(value) {
			return value === void 0 ? "" : formatCapacity(value);
		}
		/** Adopt a candidate, preserving disclosed capacities and defaulting image input on. */
		function adopt(candidate) {
			return {
				id: candidate.id,
				...candidate.name === void 0 ? {} : { name: candidate.name },
				...candidate.contextWindow === void 0 ? {} : { contextWindow: candidate.contextWindow },
				...candidate.maxTokens === void 0 ? {} : { maxTokens: candidate.maxTokens },
				input: [...candidate.inputModalities ?? ["text", "image"]]
			};
		}
		// Display groups follow named-key order. Rows keep their original array
		// indices: sorting never rebinds a model or merges identical upstream ids.
		function effectiveModelKeyId(model, entries = [], defaultId) {
			return model.apiKey || entries.find((entry) => entry.id === defaultId)?.id || entries[0]?.id;
		}
		function groupModelsByKey(models, entries, defaultId, t) {
			if (entries === void 0) return [{ id: "", name: "", rows: models.map((model, index) => ({ model, index })) }];
			const groups = new Map(entries.map((entry) => [entry.id, { id: entry.id, name: entry.name || entry.id, rows: [] }]));
			for (const [index, model] of models.entries()) {
				const id = effectiveModelKeyId(model, entries, defaultId) ?? "";
				if (!groups.has(id)) groups.set(id, { id, name: id ? `${t("keyUnavailable")} · ${id}` : t("modelKeyNative"), rows: [], missing: Boolean(id) });
				groups.get(id).rows.push({ model, index });
			}
			return [...groups.values()];
		}
		// Run only on explicit Save. Freeze each legacy unbound row to the same
		// effective key it used before, retaining every hidden model/profile field.
		function fixedModelKeyProfile(draft, fallback, entries, defaultId) {
			if (!entries.length) return draft;
			const bind = (model) => ({ ...model, apiKey: effectiveModelKeyId(model, entries, defaultId) });
			const next = { ...draft };
			if (!Array.isArray(fallback?.apiKeys) || !fallback.apiKeys.length) next.apiKeys = entries.map((entry) => ({ ...entry }));
			if (!entries.some((entry) => entry.id === (draft.activeApiKey ?? fallback?.activeApiKey))) next.activeApiKey = effectiveModelKeyId({}, entries, defaultId);
			if (Array.isArray(draft.models)) next.models = draft.models.map(bind);
			const overrides = draft.modelOverrides ?? fallback?.modelOverrides;
			if (overrides && Object.values(overrides).some((model) => !model.apiKey)) next.modelOverrides = Object.fromEntries(Object.entries(overrides).map(([id, model]) => [id, bind(model)]));
			return next;
		}
		/**
		* Render the model list with its fetch action.
		* @param props - the drafted rows, probe target, wire face, and copy.
		* @returns the model-list editor.
		*/
		function ModelListEditor(props) {
			const { models, onChange, probe, operations, t, disabled, onBusyChange } = props;
			const { catalogProvider } = props;
			const [busy, setBusy] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				onBusyChange(busy);
			}, [busy, onBusyChange]);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [inheritedCatalog, setInheritedCatalog] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				if (catalogProvider === void 0) return;
				let current = true;
				operations.discoverModels(probe.settingsNs, { provider: catalogProvider }).then((answer) => {
					if (!current) return;
					setInheritedCatalog({
						provider: catalogProvider,
						models: answer.kind === "found" ? answer.models : []
					});
					setFailure(answer.kind === "refused" ? answer.message : void 0);
				});
				return () => {
					current = false;
				};
			}, [
				catalogProvider,
				operations,
				probe.settingsNs
			]);
			const catalog = inheritedCatalog?.provider === catalogProvider ? inheritedCatalog?.models : void 0;
			const inputDefaults = (0, react.useMemo)(() => new Map(catalog?.map((model) => [model.id, model.inputModalities])), [catalog]);
			const [candidates, setCandidates] = (0, react.useState)(void 0);
			const [picked, setPicked] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [candidateQuery, setCandidateQuery] = (0, react.useState)("");
			const [editing, setEditing] = (0, react.useState)(/* @__PURE__ */ new Map());
			const [editingIndex, setEditingIndex] = (0, react.useState)(void 0);
			const [dragIndex, setDragIndex] = (0, react.useState)(void 0);
			const [fetchKeyId, setFetchKeyId] = (0, react.useState)(void 0);
			const [addMode, setAddMode] = (0, react.useState)(void 0);
			const [manual, setManual] = (0, react.useState)({});
			const [manualFailure, setManualFailure] = (0, react.useState)(void 0);
			const [fetchedKeyId, setFetchedKeyId] = (0, react.useState)(void 0);
			const fetchSeq = (0, react.useRef)(0);
			const fetchKeyEntries = props.apiKeys ?? [];
			const selectedFetchKeyId = fetchKeyId;
			const selectedFetchKey = fetchKeyEntries.find((entry) => entry.id === selectedFetchKeyId);
			const selectedFetchKeyName = selectedFetchKey?.name ?? (selectedFetchKeyId ? selectedFetchKeyId : t("modelKeyNative"));
			const keyGroups = groupModelsByKey(models, props.apiKeys, props.defaultApiKey, t);
			const addModel = (keyId = effectiveModelKeyId({}, fetchKeyEntries, props.defaultApiKey)) => {
				fetchSeq.current++;
				setBusy(false);
				setFetchKeyId(keyId);
				setFetchedKeyId(void 0);
				setCandidates(void 0);
				setPicked(new Set());
				setCandidateQuery("");
				setFailure(void 0);
				setManual({ id: "", name: "", contextWindow: "", maxTokens: "", image: true });
				setManualFailure(void 0);
				setAddMode("fetch");
			};
			// Late discovery responses must never reopen a dismissed picker.
			(0, react.useEffect)(() => () => { fetchSeq.current++; }, []);
			/** Buffer key for one capacity field; the row half moves when rows do. */
			const bufferKey = (index, field) => `${String(index)}:${field}`;
			const editCapacity = (index, field, text) => {
				setEditing((current) => new Map(current).set(bufferKey(index, field), text));
				patch(index, { [field]: parseCapacity(text) });
			};
			/** What a capacity field shows: the buffer while typing, else the stored count. */
			const capacityText = (model, index, field) => editing.get(bufferKey(index, field)) ?? capacitySpelling(numberOf(model, field));
			/** Drop one row's entries and shift the rows after it down, in one pass. */
			const reindexOnRemove = (current, index) => {
				const next = /* @__PURE__ */ new Map();
				for (const [key, value] of current) {
					const at = Number(key.slice(0, key.indexOf(":")));
					if (at === index) continue;
					next.set(at > index ? key.replace(/^\d+/, String(at - 1)) : key, value);
				}
				return next;
			};
			const moveModel = (from, to) => {
				if (from === to || from < 0 || to < 0 || from >= models.length || to >= models.length) return;
				if (effectiveModelKeyId(models[from], fetchKeyEntries, props.defaultApiKey) !== effectiveModelKeyId(models[to], fetchKeyEntries, props.defaultApiKey)) return;
				const next = models.slice();
				const [item] = next.splice(from, 1);
				next.splice(to, 0, item);
				onChange(next);
				setEditing((current) => {
					const shifted = /* @__PURE__ */ new Map();
					for (const [key, value] of current) {
						const at = Number(key.slice(0, key.indexOf(":")));
						let dest = at;
						if (at === from) dest = to;
						else if (from < to && at > from && at <= to) dest = at - 1;
						else if (from > to && at >= to && at < from) dest = at + 1;
						shifted.set(`${String(dest)}:${key.slice(key.indexOf(":") + 1)}`, value);
					}
					return shifted;
				});
				setEditingIndex((current) => {
					if (current === void 0) return current;
					if (current === from) return to;
					if (from < to && current > from && current <= to) return current - 1;
					if (from > to && current >= to && current < from) return current + 1;
					return current;
				});
			};
			const patch = (index, next) => {
				onChange(models.map((model, at) => {
					if (at !== index) return model;
					const cleared = new Set(Object.entries(next).filter(([, value]) => value === void 0 || value === "").map(([key]) => key));
					return Object.fromEntries(Object.entries({
						...model,
						...next
					}).filter(([key]) => !cleared.has(key)));
				}));
			};
			const failFetch = (message) => {
				setFailure(message);
				setCandidates([]);
				setPicked(/* @__PURE__ */ new Set());
				setFetchedKeyId(void 0);
			};
			const fetchModels = async (keyId = selectedFetchKeyId) => {
				const seq = ++fetchSeq.current;
				const selected = fetchKeyEntries.find((entry) => entry.id === keyId);
				const typed = (keyId === void 0 ? probe.apiKey : props.keyValues?.[keyId])?.trim() ?? "";
				setBusy(true);
				setFailure(void 0);
				setCandidateQuery("");
				setCandidates([]);
				setPicked(/* @__PURE__ */ new Set());
				try {
					if (typed.length === 0 && selected?.id !== "legacy-default" && props.keyStates?.[keyId]?.configured === false) {
						failFetch(t("fetchNeedsKey"));
						return;
					}
					const namedStoredKey = selected !== void 0 && selected.id !== "legacy-default";
					const answer = await operations.discoverModels(probe.settingsNs, {
						...probe.provider === void 0 ? {} : { provider: probe.provider },
						...probe.baseURL === void 0 || probe.baseURL.length === 0 ? {} : { baseURL: probe.baseURL },
						...probe.api === void 0 ? {} : { api: probe.api },
						...typed.length > 0 ? { apiKey: typed } : namedStoredKey ? { apiKey: selected.id } : {}
					});
					if (seq !== fetchSeq.current) return;
					if (answer.kind === "refused") {
						failFetch(answer.message);
						return;
					}
					const found = answer.models;
					if (catalogProvider !== void 0) setInheritedCatalog({
						provider: catalogProvider,
						models: found
					});
					if (found.length === 0) {
						failFetch(t("fetchEmpty"));
						return;
					}
					setCandidates(found);
					setFetchedKeyId(keyId);
					const boundKey = keyId ?? props.defaultApiKey;
					setPicked(new Set(found.filter((model) => !models.some((existing) => (existing.upstreamModelId ?? existing.id) === model.id && effectiveModelKeyId(existing, fetchKeyEntries, props.defaultApiKey) === boundKey)).map((model) => model.id)));
				} catch (error) {
					if (seq !== fetchSeq.current) return;
					failFetch(error instanceof Error && error.message ? error.message : t("fetchEmpty"));
				} finally {
					if (seq === fetchSeq.current) setBusy(false);
				}
			};
			const closePicker = () => {
				fetchSeq.current++;
				setBusy(false);
				setAddMode(void 0);
				setFailure(void 0);
				setManualFailure(void 0);
				setCandidates(void 0);
				setPicked(/* @__PURE__ */ new Set());
				setCandidateQuery("");
				setFetchedKeyId(void 0);
			};
			const switchAddMode = (mode) => {
				if (mode === addMode) return;
				// Changing to manual entry also releases a pending discovery operation.
				if (busy) {
					fetchSeq.current++;
					setBusy(false);
					setCandidates(void 0);
					setFailure(void 0);
					setPicked(new Set());
				}
				setAddMode(mode);
			};
			const addManual = () => {
				if (disabled || busy) return;
				const model = {
					id: manual.id.trim(),
					...manual.name.trim() ? { name: manual.name.trim() } : {},
					input: manual.image ? ["text", "image"] : ["text"],
					...selectedFetchKeyId ? { apiKey: selectedFetchKeyId } : {}
				};
				for (const field of ["contextWindow", "maxTokens"]) {
					if (manual[field].trim()) model[field] = parseCapacity(manual[field]);
				}
				const invalid = validateDeepSeekModels([model]);
				if (invalid) { setManualFailure(t(invalid.key)); return; }
				if (models.some((existing) => (existing.upstreamModelId ?? existing.id) === model.id && effectiveModelKeyId(existing, fetchKeyEntries, props.defaultApiKey) === selectedFetchKeyId)) {
					setManualFailure(t("modelAlreadyAdded"));
					return;
				}
				onChange([...models, model]);
				closePicker();
			};
			const adoptPicked = () => {
				/* v8 ignore next -- the dialog only renders with candidates loaded */
				if (busy || disabled || candidates === void 0 || picked.size === 0) return;
				const next = models.map((model) => ({ ...model }));
				for (const candidate of candidates) {
					if (!picked.has(candidate.id)) continue;
					if (next.some((existing) => (existing.upstreamModelId ?? existing.id) === candidate.id && effectiveModelKeyId(existing, fetchKeyEntries, props.defaultApiKey) === (fetchedKeyId ?? selectedFetchKeyId))) continue;
					next.push({
						...adopt(candidate),
						...(fetchedKeyId ?? selectedFetchKeyId) === void 0 ? {} : { apiKey: fetchedKeyId ?? selectedFetchKeyId }
					});
				}
				onChange(next);
				closePicker();
			};
			const toggle = (id) => {
				setPicked((current) => {
					const next = new Set(current);
					if (!next.delete(id)) next.add(id);
					return next;
				});
			};
			const activeCandidates = candidates ?? [];
			const normalizedCandidateQuery = candidateQuery.trim().toLowerCase();
			const visibleCandidates = normalizedCandidateQuery.length === 0 ? activeCandidates : activeCandidates.filter((candidate) => candidate.id.toLowerCase().includes(normalizedCandidateQuery) || candidate.name?.toLowerCase().includes(normalizedCandidateQuery) === true);
			const allVisibleCandidatesPicked = visibleCandidates.length > 0 && visibleCandidates.every((candidate) => picked.has(candidate.id));
			const toggleVisibleCandidates = () => {
				setPicked((current) => {
					if (visibleCandidates.every((candidate) => current.has(candidate.id))) return /* @__PURE__ */ new Set();
					const next = new Set(current);
					for (const candidate of visibleCandidates) next.add(candidate.id);
					return next;
				});
			};
			const askable = probe.provider !== void 0 || probe.baseURL !== void 0 && probe.baseURL.length > 0;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ModelsSection_module_css_default["modelCatalog"],
				"aria-label": t("models"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelListHead"],
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["modelCatalogHeading"],
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["modelCatalogTitle"],
									children: t("models")
								}), props.overridden === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["modelCatalogMeta"],
									children: props.overridden ? t("modelsCustomized") : t("modelsInherited")
								})]
							}),

						]
					}),
					failure !== void 0 && addMode === void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: failure
					}) : null,
					models.length === 0 && !props.apiKeys?.length ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["modelEmpty"],
						children: t("modelsEmpty")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: "zGbnIq_modelKeyGroups",
						children: keyGroups.map((group) => react.createElement("section", {
							key: group.id, className: "zGbnIq_modelKeySection", "data-model-key": group.id,
							"aria-label": group.name || t("models")
						}, props.apiKeys !== void 0 ? react.createElement("div", { className: "zGbnIq_modelKeyHeading" },
							react.createElement("span", { className: "zGbnIq_modelKeyName", title: group.name }, group.name),
							react.createElement("span", { className: "zGbnIq_modelKeyCount" }, group.rows.length),
							!group.missing && group.id ? react.createElement("button", {
								type: "button", className: ModelsSection_module_css_default.linkButton, disabled,
								"aria-label": `${t("addModel")} · ${group.name}`, onClick: () => addModel(group.id)
							}, "+ ", t("addModel")) : null
						) : null, group.rows.length ? react.createElement("div", { className: ModelsSection_module_css_default.modelList }, group.rows.map(({ model, index }) => {
							const title = textOf(model, "name") || textOf(model, "id") || t("model");
							return (0, react_jsx_runtime.jsxs)("div", {
								className: `${ModelsSection_module_css_default["modelChip"]}${dragIndex === index ? ` ${ModelsSection_module_css_default["modelChipDragging"]}` : ""}`,
								draggable: !disabled,
								onDragOver: (event) => {
									if (disabled || dragIndex === void 0 || effectiveModelKeyId(models[dragIndex], fetchKeyEntries, props.defaultApiKey) !== effectiveModelKeyId(model, fetchKeyEntries, props.defaultApiKey)) return;
									event.preventDefault();
								},
								onDrop: (event) => {
									event.preventDefault();
									if (dragIndex === void 0) return;
									moveModel(dragIndex, index);
									setDragIndex(void 0);
								},
								onDragStart: (event) => {
									if (disabled || event.target.closest?.("button")) {
										event.preventDefault();
										return;
									}
									setDragIndex(index);
									event.dataTransfer.effectAllowed = "move";
									event.dataTransfer.setData("text/plain", String(index));
								},
								onDragEnd: () => setDragIndex(void 0),
								onDoubleClick: () => {
									if (disabled) return;
									setEditingIndex(index);
								},
								title: `${title}${group.name ? ` · ${group.name}` : ""} · ${t("modelEditHint")} · ${t("modelReorder")}`,
								"data-model-index": index,
								onKeyDown: (event) => { if (!disabled && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setEditingIndex(index); } },
								tabIndex: disabled ? -1 : 0,
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelChipTitle"], children: title }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
										"aria-label": `${t("removeModel")} ${index + 1}`,
										title: t("removeModel"),
										disabled,
										onClick: (event) => {
											event.stopPropagation();
											onChange(models.filter((_model, at) => at !== index));
											setEditing((current) => reindexOnRemove(current, index));
											setEditingIndex((current) => current === void 0 ? current : current === index ? void 0 : current > index ? current - 1 : current);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
									})
								]
							}, `${textOf(model, "id") || "model"}-${index}`);
						})) : react.createElement("p", { className: "zGbnIq_modelKeyEmpty" }, t("modelKeyEmpty"))))
					}),
					!fetchKeyEntries.length ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addModelButton"],
						disabled,
						onClick: () => {
							addModel();
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("addModel")]
					}) : null,
					editingIndex !== void 0 && models[editingIndex] !== void 0 ? (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: true,
						onClose: () => setEditingIndex(void 0),
						title: textOf(models[editingIndex], "name") || textOf(models[editingIndex], "id") || t("model"),
						closeLabel: t("close"),
						className: ModelsSection_module_css_default["modelEditDialog"],
						footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: () => setEditingIndex(void 0),
							children: t("done")
						}),
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["modelEditForm"],
							children: [
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: t("modelId") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: textOf(models[editingIndex], "id"),
										placeholder: t("modelId"),
										disabled,
										onChange: (event) => patch(editingIndex, { id: event.target.value })
									})]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: t("modelName") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: textOf(models[editingIndex], "name"),
										placeholder: t("modelNamePlaceholder"),
										disabled,
										onChange: (event) => patch(editingIndex, { name: event.target.value === "" ? void 0 : event.target.value })
									})]
								}),
								props.apiKeys !== void 0 ? react.createElement(KeySelect, {
									entries: props.apiKeys, value: effectiveModelKeyId(models[editingIndex], props.apiKeys, props.defaultApiKey), disabled, t, omitDefault: true,
									label: t("modelApiKey"),
									onChange: (value) => patch(editingIndex, { apiKey: value })
								}) : null,
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: t("modelContextWindow") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										inputMode: "numeric",
										value: capacityText(models[editingIndex], editingIndex, "contextWindow"),
										placeholder: CAPACITY_HINT.contextWindow,
										disabled,
										onChange: (event) => editCapacity(editingIndex, "contextWindow", event.target.value)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: t("modelMaxTokens") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										inputMode: "numeric",
										value: capacityText(models[editingIndex], editingIndex, "maxTokens"),
										placeholder: CAPACITY_HINT.maxTokens,
										disabled,
										onChange: (event) => editCapacity(editingIndex, "maxTokens", event.target.value)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: `${ModelsSection_module_css_default["modelField"]} zGbnIq_imageField`,
									children: [(0, react_jsx_runtime.jsx)("span", { className: ModelsSection_module_css_default["modelFieldLabel"], children: t("modelImageInput") }), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "checkbox",
										checked: Array.isArray(models[editingIndex].input) && models[editingIndex].input.includes("image"),
										disabled,
										onChange: (event) => patch(editingIndex, { input: event.target.checked ? ["text", "image"] : ["text"] })
									})]
								})
							]
						})
					}) : null,
					(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: addMode !== void 0,
						onClose: closePicker,
						title: t("addModel"),
						closeLabel: t("close"),
						description: t("addModelDescription"),
						className: `${ModelsSection_module_css_default.fetchDialog} zGbnIq_addModelDialog`,
						footer: react.createElement(react.Fragment, null,
							react.createElement(_deepseek_ai_dsh_client_ui_primitives.Button, { variant: "outline", onClick: closePicker }, t("cancel")),
							react.createElement(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: disabled || busy || (addMode === "fetch" ? picked.size === 0 : !manual.id?.trim()),
								onClick: addMode === "manual" ? addManual : adoptPicked
							}, t(addMode === "manual" ? "addModel" : "fetchAdopt"))
						),
						children: [
							react.createElement("div", { className: "zGbnIq_addModelKey" },
								react.createElement("span", null, t("modelApiKey")),
								react.createElement("strong", { title: selectedFetchKeyName }, selectedFetchKeyName)),
							react.createElement("div", { className: "zGbnIq_addModelModes", role: "group", "aria-label": t("addModelMethod") },
								...["fetch", "manual"].map((mode) => react.createElement("button", {
									key: mode, type: "button", "aria-pressed": addMode === mode,
									onClick: () => switchAddMode(mode)
								}, t(mode === "fetch" ? "fetchModels" : "addModelManual")))),
							addMode === "manual" ? react.createElement("div", { className: ModelsSection_module_css_default.modelEditForm },
								...["id", "name", "contextWindow", "maxTokens"].map((field) => react.createElement("label", { key: field, className: ModelsSection_module_css_default.modelField },
									react.createElement("span", { className: ModelsSection_module_css_default.modelFieldLabel }, t({ id: "modelId", name: "modelName", contextWindow: "modelContextWindow", maxTokens: "modelMaxTokens" }[field])),
									react.createElement("input", {
										className: ModelsSection_module_css_default.input, type: "text", disabled,
										value: manual[field] ?? "", inputMode: ["contextWindow", "maxTokens"].includes(field) ? "decimal" : void 0,
										placeholder: CAPACITY_HINT[field] ?? t(field === "name" ? "modelNamePlaceholder" : "modelId"),
										onChange: (event) => { setManual({ ...manual, [field]: event.target.value }); setManualFailure(void 0); }
									}))),
								react.createElement("label", { className: `${ModelsSection_module_css_default.modelField} zGbnIq_imageField` },
									react.createElement("span", { className: ModelsSection_module_css_default.modelFieldLabel }, t("modelImageInput")),
									react.createElement("input", { type: "checkbox", className: ModelsSection_module_css_default.input, disabled, checked: !!manual.image, onChange: (event) => setManual({ ...manual, image: event.target.checked }) })),
								manualFailure ? react.createElement("p", { className: ModelsSection_module_css_default.error, role: "alert" }, manualFailure) : null
							) : react.createElement(react.Fragment, null,
								react.createElement("div", { className: "zGbnIq_addModelFetch" },
									react.createElement("span", null, t("fetchFixedKeyHint")),
									react.createElement(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline", disabled: disabled || busy || !askable || props.probeBlocked !== void 0,
										onClick: () => fetchModels(),
									}, t(busy ? "fetching" : candidates === void 0 ? "fetchStart" : "fetchRefresh"))),
								!askable || props.probeBlocked !== void 0 ? react.createElement("p", { className: ModelsSection_module_css_default.error }, t(props.probeBlocked ?? "fetchNeedsBaseUrl")) : null,
								candidates !== void 0 && !busy && !failure ? react.createElement("div", { className: ModelsSection_module_css_default.candidateToolbar },
									react.createElement("input", { className: `${ModelsSection_module_css_default.input} ${ModelsSection_module_css_default.candidateSearch}`, type: "search", value: candidateQuery, placeholder: t("fetchSearch"), "aria-label": t("fetchSearch"), onChange: (event) => setCandidateQuery(event.target.value) }),
									react.createElement(_deepseek_ai_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", disabled: visibleCandidates.length === 0, onClick: toggleVisibleCandidates }, t(allVisibleCandidatesPicked ? "fetchDeselectAll" : "fetchSelectAll"))) : null,
								failure ? react.createElement("p", { className: ModelsSection_module_css_default.error, role: "alert" }, failure) : null,
								busy || !visibleCandidates.length ? react.createElement("p", { className: ModelsSection_module_css_default.candidateEmpty, role: "status" }, t(busy ? "fetching" : candidates === void 0 ? "fetchReady" : failure ? "fetchManualFallback" : "fetchNoMatches")) : react.createElement("ul", { className: ModelsSection_module_css_default.candidateList },
									...visibleCandidates.map((candidate) => react.createElement("li", { key: candidate.id, className: ModelsSection_module_css_default.candidate },
										react.createElement("label", { className: ModelsSection_module_css_default.candidateLabel },
											react.createElement("input", { type: "checkbox", checked: picked.has(candidate.id), onChange: () => toggle(candidate.id) }),
											react.createElement("span", { className: ModelsSection_module_css_default.candidateId, title: candidate.name ?? candidate.id }, candidate.id)))))
							)
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/store.js
		/**
		* Models settings page store: one snapshot joining the configurable-provider
		* directory (`llm/listProviders` joined with `llm/listConfigurableProviders`),
		* the settings namespaces (shared settings mirror),
		* and the referenced credentials (`credentials/describe`). The host stays the
		* single fact source — every mutation writes through the wire and the page
		* re-renders from the next describe, pushed or refetched.
		*/
		/**
		* Any route key walks a dict schema to the same profile node, so the lookup
		* names one that cannot collide with a configured route.
		*/
		const PROBE_ROUTE = "\0probe";
		/**
		* Join declared configurable providers with the currently registered routes.
		* @param registered - live provider routes in registration order.
		* @param directory - declared configurable providers in declaration order.
		* @returns account and official routes first, then other routes in their original order.
		*/
		function joinProviderDirectory(registered, directory) {
			const active = new Set(registered.map((provider) => provider.id));
			const declared = new Set(directory.map((entry) => entry.provider));
			const rows = directory.map((entry) => ({
				provider: entry.provider,
				displayName: entry.displayName,
				settingsNs: entry.settingsNs,
				settingsPath: [...entry.settingsPath],
				active: active.has(entry.provider),
				...entry.declared === void 0 ? {} : { declared: entry.declared },
				...entry.error === void 0 ? {} : { error: entry.error }
			}));
			for (const provider of registered) {
				if (declared.has(provider.id)) continue;
				rows.push({
					provider: provider.id,
					displayName: provider.name,
					settingsNs: "",
					settingsPath: [],
					active: true
				});
			}
			return rows.toSorted((left, right) => (left.provider === "deepseek-account" ? 0 : left.provider === "deepseek-official" ? 1 : 2) - (right.provider === "deepseek-account" ? 0 : right.provider === "deepseek-official" ? 1 : 2));
		}
		/**
		* Derive the conventional credential reference for a provider route: the v1
		* page never asks for an environment-variable name, so a typed key stores
		* under this derived reference and the profile records it as `apiKeyEnv`.
		* @param provider - provider route id (e.g. `anthropic`, `minimax-cn`).
		* @returns the derived reference name (e.g. `MINIMAX_CN_API_KEY`).
		*/
		function deriveKeyRef(provider) {
			return `${provider.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_API_KEY`;
		}
		/**
		* The wire protocols a hand-declared route may name, read out of the owning
		* namespace's own schema. This stays a schema read rather than a wire field so
		* the choices the page offers cannot drift from the ones the adapter accepts:
		* both come from the same `Config`.
		* @param namespace - the namespace view whose schema declares the profile shape.
		* @param schema - settings schema operations.
		* @returns the protocol identifiers, or an empty list when the schema has none.
		*/
		function protocolChoices(namespace, schema) {
			if (namespace === void 0) return [];
			const list = schema.nodeAtPath(schema.rehydrate(namespace.schema), [
				"providers",
				PROBE_ROUTE,
				"api"
			]);
			if (list?.type !== "union" || list.list === void 0) return [];
			return list.list.map((entry) => entry.value).filter((value) => typeof value === "string");
		}
		/** The credential reference a resolved profile names (its `apiKeyEnv` field). */
		function apiKeyEnvOf(namespace, path, schema) {
			if (namespace === void 0) return void 0;
			const profile = schema.getPath(namespace.value, path);
			if (typeof profile !== "object" || profile === null) return void 0;
			const ref = profile.apiKeyEnv;
			return typeof ref === "string" && ref.length > 0 ? ref : void 0;
		}
		/** The models settings page controller (one per settings surface). */
		var ModelsSettingsStore = class {
			ctx;
			schema;
			describeFace;
			/** The snapshot the section renders from (uSES-safe store). */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "idle",
				error: null,
				credentialError: null,
				writable: false,
				rows: [],
				namespaces: /* @__PURE__ */ new Map()
			});
			/** Latest load wins; an older response never overwrites a newer one. */
			generation = 0;
			/**
			* @param ctx - the page plugin's context, whose `remote.llm` and
			* `remote.credentials` namespaces carry the directory and credential reads.
			* @param schema - settings-owned schema and immutable path operations.
			* @param describeFace - the shared mirror's describe face (namespace views and writability).
			*/
			constructor(ctx, schema, describeFace) {
				this.ctx = ctx;
				this.schema = schema;
				this.describeFace = describeFace;
			}
			/**
			* Refresh the whole page snapshot: the provider directory and the mirror's
			* settings answer in parallel, then one batched credential describe over
			* every referenced ref. Provider failure or absence of an initial settings
			* answer keeps the last good rows and surfaces an error; a failed settings
			* refresh reuses the mirror's held view.
			* @returns nothing; the snapshot carries the outcome.
			*/
			async load() {
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "loading";
					s.error = null;
				});
				const [registered, declared] = await Promise.all([
					this.ctx.remote.llm.listProviders(),
					this.ctx.remote.llm.listConfigurableProviders(),
					this.describeFace.ensure()
				]);
				if (!registered.ok) {
					this.failLoad(generation, registered.error.message);
					return;
				}
				if (!declared.ok) {
					this.failLoad(generation, declared.error.message);
					return;
				}
				const mirrored = this.describeFace.getSnapshot();
				if (mirrored.view === void 0) {
					this.failLoad(generation, mirrored.error ?? "settings are unavailable in this browser");
					return;
				}
				const providers = joinProviderDirectory(registered.value, declared.value);
				const writable = mirrored.view.writable;
				const views = mirrored.view.namespaces;
				const namespaces = new Map(views.map((view) => [view.ns, view]));
				const rows = providers.map((entry) => {
					const namespace = namespaces.get(entry.settingsNs);
					return {
						entry,
						configured: namespace !== void 0 && (entry.settingsPath.length === 0 || this.schema.getPath(namespace.value, entry.settingsPath) !== void 0),
						removable: namespace !== void 0 && entry.settingsPath.length > 0 && this.schema.hasPath(namespace.user, entry.settingsPath) && !this.schema.hasPath(namespace.base, entry.settingsPath),
						apiKeyEnv: entry.provider === "deepseek-account" ? void 0 : apiKeyEnvOf(namespace, entry.settingsPath, this.schema),
						credential: void 0
					};
				});
				if (rows.some((row) => row.entry.provider === "deepseek-account")) {
					const catalog = await this.ctx.remote.session.modelCatalog();
					for (const row of rows) if (row.entry.provider === "deepseek-account") row.accountAvailable = catalog.ok && catalog.value.groups.some((group) => group.id === "deepseek-account" && group.models.length > 0);
				}
				const refs = [...new Set(rows.filter((row) => row.entry.provider !== "deepseek-account").map((row) => row.apiKeyEnv ?? deriveKeyRef(row.entry.provider)))];
				let credentials = {};
				let credentialError = null;
				if (refs.length > 0) {
					const response = await this.ctx.remote.credentials.describe(refs);
					if (response.ok) credentials = response.value;
					else credentialError = response.error.message;
				}
				if (generation !== this.generation) return;
				this.store.update((s) => {
					s.status = "ready";
					s.error = null;
					s.credentialError = credentialError;
					s.writable = writable;
					s.rows = rows.filter((row) => row.entry.provider !== "deepseek-account" || row.accountAvailable === true).map((row) => {
						if (row.entry.provider === "deepseek-account") return row;
						const named = row.apiKeyEnv === void 0 ? void 0 : credentials[row.apiKeyEnv];
						const derived = row.apiKeyEnv !== void 0 ? void 0 : credentials[deriveKeyRef(row.entry.provider)];
						return {
							...row,
							...named === void 0 ? {} : { credential: named },
							...derived === void 0 ? {} : { derivedCredential: derived }
						};
					});
					s.namespaces = namespaces;
				});
			}
			/** Publish one load's failure text, unless a newer load already took over. */
			failLoad(generation, message) {
				if (generation !== this.generation) return;
				this.store.update((s) => {
					s.status = "error";
					s.error = message;
				});
			}
		};
		/**
		* Whether a joined row can serve model requests as it stands: the route is
		* registered with the adapter registry, and whatever credential its resolved
		* profile names is stored. A profile naming no reference authenticates through
		* the provider's own path (the Bedrock chain, Vertex ADC, a gateway that needs
		* nothing), as does a live route with no settings address at all, so neither
		* owes this page a key.
		* @param row - one joined provider row.
		* @returns whether the user already has this provider to talk to.
		*/
		function providerUsable(row) {
			if (!row.entry.active) return false;
			if (row.entry.provider === "deepseek-account") return row.accountAvailable === true;
			if (row.apiKeyEnv === void 0) return true;
			return row.credential?.configured === true;
		}
		/**
		* Project first-run readiness from the provider/settings/credential join used
		* by the Models page. The step exists to leave the user with a model to talk
		* to, so ANY usable provider ends it; only when none exists does the official
		* DeepSeek route — the one route the prompt can offer a key field for — decide
		* whether prompting can help. A missing official configurable-provider
		* declaration means the adapter is not repairable by navigating to Models.
		* @param state - current shared Models join snapshot.
		* @returns the onboarding state without reading a parallel fact source.
		*/
		function onboardingReadiness(state) {
			if ((state.status === "idle" || state.status === "loading") && state.rows.length === 0) return { kind: "loading" };
			if (state.status === "error") return {
				kind: "unavailable",
				reason: "load-failed"
			};
			if (state.rows.some(providerUsable)) return { kind: "provider-ready" };
			const row = state.rows.find((candidate) => candidate.entry.provider === "deepseek-official" && candidate.entry.settingsNs === "llm-deepseek" && candidate.entry.settingsPath.length === 0);
			if (row === void 0) return { kind: "adapter-absent" };
			if (!row.entry.active) return {
				kind: "unavailable",
				reason: "provider-inactive"
			};
			if (state.credentialError !== null || row.credential === void 0) return {
				kind: "unavailable",
				reason: "credentials-unavailable"
			};
			if (!state.writable) return {
				kind: "unavailable",
				reason: "settings-read-only"
			};
			if (!row.credential.writable) return {
				kind: "unavailable",
				reason: "credential-read-only"
			};
			return { kind: "credential-missing" };
		}
		//#endregion
		//#region lib/types/client/protocol-label.js
		/**
		* Product names for the wire protocols a pi-ai route may speak. The pickers
		* show these instead of the schema identifiers (`openai-completions`), which
		* are what `settings.yaml` carries and what the option values stay.
		*/
		/** The protocols this page names, keyed by their schema identifier. */
		const PROTOCOL_LABEL_KEYS = {
			"openai-completions": "protocolOpenAiCompletions",
			"openai-responses": "protocolOpenAiResponses",
			"anthropic-messages": "protocolAnthropicMessages"
		};
		/**
		* The picker text for one protocol identifier.
		* @param t - section copy.
		* @param protocol - the schema identifier of the protocol.
		* @returns the product name this page knows the protocol by; a protocol the
		* adapter adds before this page names it shows its identifier, the spelling
		* `settings.yaml` needs anyway.
		*/
		function protocolLabel(t, protocol) {
			const key = PROTOCOL_LABEL_KEYS[protocol];
			return key === void 0 ? protocol : t(key);
		}
		//#endregion
		//#region lib/types/client/CustomProviderCard.js
		/**
		* The card that declares a provider pi-ai does not ship — an OpenAI-compatible
		* gateway, a self-hosted server, or a provider newer than the installed
		* catalog.
		*
		* This is a create, not an edit, which is why it is its own form rather than
		* the provider editor with extra fields: the route id is being *chosen* here,
		* and the settings address does not exist until it is. It renders as the
		* custom-API panel of the section's add card; the card's mode switch names it
		* when both modes are offered, and with the custom mode alone the card shows
		* this form directly. One `settings.mutate` sets the whole profile at
		* `providers.<route>`; the key travels separately through `credentials/set`
		* under the reference the profile records, exactly as an existing provider's
		* key does.
		*
		* The three fields a hand-declared route cannot default — endpoint, protocol,
		* and at least one model — are required here rather than at load, so the
		* failure names the field while the user is still looking at it.
		*
		* There is deliberately no reasoning-effort control, here or on the editor
		* card: effort is a per-MODEL capability, and the models under one provider
		* disagree about it, so a provider-scoped control can only be set to a value
		* some of them reject. The composer's model picker offers each model its own
		* levels instead.
		*/
		/** The settings namespace a hand-declared provider is written into. */
		const NS$1 = "llm-pi-ai";
		/**
		* A route id usable as a settings key AND as the stem of a credential name.
		* The leading letter is the second half of that: `deriveKeyRef` uppercases the
		* id and replaces every non-alphanumeric run with `_`, and a credential
		* reference is a POSIX shell identifier, which cannot start with a digit. A
		* digit-leading id passes every check this card makes and then fails at the
		* credential seam with a raw regular expression the user cannot act on.
		*/
		const ROUTE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
		function isHttpUrl(value) {
			try {
				const protocol = new URL(value).protocol;
				return protocol === "http:" || protocol === "https:";
			} catch {
				return false;
			}
		}
		/**
		* Render the custom-provider creation card.
		* @param props - existing routes, protocol choices, wire faces, and copy.
		* @returns the creation card.
		*/
		function CustomProviderCard(props) {
			const { taken, protocols, operations, t, onBusyChange } = props;
			const [openedAt] = (0, react.useState)(() => props.revision);
			const [route, setRoute] = (0, react.useState)("");
			const [displayName, setDisplayName] = (0, react.useState)("");
			const [baseURL, setBaseURL] = (0, react.useState)("");
			const [protocol, setProtocol] = (0, react.useState)(protocols[0] ?? "");
			const [keyDraft, setKeyDraft] = (0, react.useState)("");
			const [models, setModels] = (0, react.useState)([]);
			const [busy, setBusy] = (0, react.useState)(false);
			const [listBusy, setListBusy] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				onBusyChange?.(busy || listBusy);
			}, [
				busy,
				listBusy,
				onBusyChange
			]);
			const [failure, setFailure] = (0, react.useState)(void 0);
			/**
			* The profile write landed. Only the key write can still be outstanding, so
			* the fields that describe the provider are settled and the retry path is
			* the credential alone.
			*/
			const [committed, setCommitted] = (0, react.useState)(false);
			const disabled = props.readOnly || busy || listBusy;
			/** Everything but the key stops being editable once the provider exists. */
			const profileDisabled = disabled || committed;
			const routeInvalid = route.length > 0 && !ROUTE_PATTERN.test(route);
			const routeTaken = taken.includes(route);
			const normalizedBaseURL = baseURL.trim();
			const baseUrlInvalid = baseURL.length > 0 && !isHttpUrl(normalizedBaseURL);
			const modelFailure = validateDeepSeekModels(models);
			const keyFailure = apiKeyFailure(keyDraft);
			const keyValue = keyDraft.trim();

			const ready = route.length > 0 && !routeInvalid && !routeTaken && normalizedBaseURL.length > 0 && !baseUrlInvalid && models.length > 0 && modelFailure === void 0 && keyFailure === void 0;
			const hint = failure !== void 0 || ready || keyFailure !== void 0 || route.length === 0 || routeInvalid || routeTaken || baseUrlInvalid ? void 0 : normalizedBaseURL.length === 0 ? t("customNeedsBaseUrl") : modelFailure !== void 0 ? `${t("model")} ${String(modelFailure.index + 1)}: ${t(modelFailure.key)}` : t("customNeedsModels");
			/** Perform the create, returning a failure message or undefined. */
			const createOnce = async () => {
				const keyRef = deriveKeyRef(route);
				const storesKey = keyValue.length > 0;
				if (!committed) {
					const profile = {
						...displayName.length === 0 ? {} : { displayName },
						...storesKey ? { apiKeyEnv: keyRef, apiKeys: [{ id: "legacy-default", name: t("groupDefault"), credentialRef: keyRef }], activeApiKey: "legacy-default" } : {},
						api: protocol,
						baseURL: normalizedBaseURL,
						models: prepareModelEntries(models.map((model) => ({ ...model, ...storesKey ? { apiKey: "legacy-default" } : {} })))
					};
					const written = await operations.writeSettings(NS$1, [{
						op: "set",
						path: ["providers", route],
						value: profile
					}], openedAt);
					if (written.kind !== "written") return written.kind === "conflict" ? t("conflict") : written.message;
					setCommitted(true);
				}
				if (storesKey) {
					const stored = await operations.storeCredential(keyRef, keyValue);
					if (stored !== void 0) return stored;
				}
			};
			const create = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					const outcome = await createOnce();
					if (outcome !== void 0) {
						setFailure(outcome);
						return;
					}
					props.onClose(true);
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["editor"],
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customRoute")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: route,
							placeholder: "acme-gateway",
							"aria-label": t("customRoute"),
							disabled: profileDisabled,
							onChange: (event) => {
								setRoute(event.target.value);
							}
						})]
					}),
					routeInvalid || routeTaken ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t(routeInvalid ? "customRouteInvalid" : "customRouteTaken")
					}) : (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["advancedHint"],
						children: t("customRouteHint")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customDisplayName")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: displayName,
							placeholder: route.length === 0 ? t("customDisplayName") : route,
							"aria-label": t("customDisplayName"),
							disabled: profileDisabled,
							onChange: (event) => {
								setDisplayName(event.target.value);
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("baseUrl")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: baseURL,
							placeholder: t(protocol === "anthropic-messages" ? "customAnthropicBaseUrlPlaceholder" : "customBaseUrlPlaceholder"),
							"aria-label": t("baseUrl"),
							"aria-invalid": baseUrlInvalid,
							disabled: profileDisabled,
							onChange: (event) => {
								setBaseURL(event.target.value);
							}
						})]
					}),
					baseUrlInvalid ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t("customBaseUrlInvalid")
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customApi")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
							value: protocol,
							"aria-label": t("customApi"),
							disabled: profileDisabled,
							onChange: (event) => {
								setProtocol(event.target.value);
							},
							children: protocols.map((choice) => (0, react_jsx_runtime.jsx)("option", {
								value: choice,
								children: protocolLabel(t, choice)
							}, choice))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["fieldLabel"],
								children: t("keyInput")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								className: ModelsSection_module_css_default["input"],
								type: "password",
								autoComplete: "new-password",
								value: keyDraft,
								placeholder: t("keyPlaceholder"),
								"aria-label": t("keyInput"),
								disabled,
								onChange: (event) => {
									setKeyDraft(event.target.value);
								}
							}),
							keyFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								className: ModelsSection_module_css_default["error"],
								children: t(keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure)
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(ModelListEditor, {
						models,
						onChange: setModels,
						probe: {
							settingsNs: NS$1,
							baseURL: normalizedBaseURL,
							api: protocol,
							...keyValue.length === 0 ? {} : { apiKey: keyValue }
						},
						probeBlocked: baseUrlInvalid ? "customBaseUrlInvalid" : keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure,
						operations,
						t,
						disabled: profileDisabled,
						onBusyChange: setListBusy
					}),
					failure !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: failure
					}) : null,
					hint === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["advancedHint"],
						children: hint
					}),
					(0, react_jsx_runtime.jsx)(EditorFooter, {
						t,
						busy,
						submitDisabled: disabled || !ready,
						submitLabelKey: "create",
						submitBusyLabelKey: "creating",
						onCancel: () => {
							props.onClose(committed);
						},
						onSubmit: () => {
							create();
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/ProviderEditor.js
		/**
		* One provider's editor card, hand-written per adapter family: the primary
		* field is a single write-only **API key** input (the page never asks for an
		* environment-variable name — a typed key stores through `credentials/set`
		* under the profile's reference, deriving `<ROUTE>_API_KEY` when the profile
		* has none. The pi-ai profile records that derivation as `apiKeyEnv` only when
		* a key is entered; a blank key materializes a reference-free profile for
		* provider-native authentication);
		* the collapsed 自定义设置 area carries the per-family extras (`baseURL` for
		* both families, DeepSeek's id/name/context-window model catalog, and the
		* display name and wire protocol of a pi-ai route the adapter does not ship —
		* the two fields the create card asked that route for, editable here for the
		* same reason).
		* Reasoning effort is deliberately absent: it is a per-MODEL capability, and
		* the models under one provider disagree about it, so a provider-scoped
		* control can only be set to a value some of them reject. The composer's
		* model picker offers each model its own levels; `cordis.patch.yml` keeps the
		* profile field for a deployment that knows its route. Everything else stays
		* owned by `cordis.patch.yml`. Profile edits land as minimal `settings.mutate`
		* path ops against the stored section — the card names only the fields it can
		* see instead of rebuilding the whole subtree from a partial descriptor.
		*/
		/** A user-section subtree as a plain draft object (absent → empty). */
		function draftAt(schema, namespace, path) {
			const subtree = schema.getPath(namespace.user, path);
			if (typeof subtree !== "object" || subtree === null || Array.isArray(subtree)) return {};
			return structuredClone(subtree);
		}
		/**
		* The minimal path ops carrying `after` over `before`, both as the card sees
		* them. Only keys the card observed are named; fields absent from both sides
		* produce no op, which is why edits are path-addressed rather than a rebuilt
		* section.
		* @param base - path of the edited subtree inside the user section.
		* @param before - the subtree as loaded, or undefined when it is new.
		* @param after - the subtree as edited.
		* @returns ordered set/unset ops; empty when nothing changed.
		*/
		function pathOps(base, before, after) {
			const previous = typeof before === "object" && before !== null && !Array.isArray(before) ? before : {};
			const ops = [];
			for (const [key, value] of Object.entries(after)) {
				if (JSON.stringify(previous[key]) === JSON.stringify(value)) continue;
				ops.push({
					op: "set",
					path: [...base, key],
					value
				});
			}
			for (const key of Object.keys(previous)) if (!(key in after)) ops.push({
				op: "unset",
				path: [...base, key]
			});
			return ops;
		}
		/** The editor layout the owning namespace selects. */
		function layoutOf(ns) {
			if (ns === "llm-deepseek") return "deepseek";
			if (ns === "llm-pi-ai") return "pi-ai";
			return "unknown";
		}
		/** The credential reference this profile resolves keys through. */
		function refFor(schema, namespace, path, provider) {
			const profile = schema.getPath(namespace.value, path);
			const named = typeof profile === "object" && profile !== null ? profile.apiKeyEnv : void 0;
			return typeof named === "string" && named.length > 0 ? named : deriveKeyRef(provider);
		}
		/**
		* Render one provider's editing card.
		* @param props - the addressed profile plus wire faces and copy.
		* @returns the editor card.
		*/

        function KeySelect({ entries, value, defaultId, onChange, disabled, label, t, omitDefault, className }) {
            const h = react.createElement;
            const selectedId = value ?? defaultId;
            const selectedEntry = entries.find((entry) => entry.id === selectedId);
            const selectedName = selectedEntry?.name ?? (selectedId ? selectedId : t("modelApiKeyDefault"));
            const [open, setOpen] = react.useState(false);
            react.useEffect(() => { if (!open) return; const close = event => { if (!event.target.closest?.(".zGbnIq_keySelect")) setOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, [open]);
            const options = [
                ...(omitDefault ? [] : [{ id: "", name: t("modelApiKeyDefault") }]),
                ...(value && !entries.some((entry) => entry.id === value) ? [{ id: value, name: t("keyUnavailable") }] : []),
                ...entries
            ];
            const currentId = omitDefault ? selectedId : (value ?? "");
            return h("label", { className: [ModelsSection_module_css_default.modelField, className].filter(Boolean).join(" ") },
                h("span", { className: ModelsSection_module_css_default.modelFieldLabel }, label),
                h("div", { className: "zGbnIq_keySelect" },
                    h("button", { type: "button", className: "zGbnIq_keySelectButton", disabled, "aria-label": label, "aria-haspopup": "listbox", "aria-expanded": open, onClick: () => setOpen(!open) }, h("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, selectedName), h("span", { "aria-hidden": true }, open ? "⌃" : "⌄")),
                    open ? h("div", { className: "zGbnIq_keySelectMenu", role: "listbox", "aria-label": label }, ...options.map(entry => h("button", { type: "button", key: entry.id, className: "zGbnIq_keySelectOption", role: "option", "aria-selected": currentId === entry.id, onClick: () => { onChange(entry.id || void 0); setOpen(false); } }, entry.name))) : null));
        }
        function NamedKeysEditor({ entries, values, states, onChange, onValue, usedIds, defaultId, onDefault, disabled, t }) {
            const h = react.createElement;
            const c = ModelsSection_module_css_default;
            const dragging = react.useRef(null);
            const [dragId, setDragId] = react.useState(null), [overId, setOverId] = react.useState(null);
            const endDrag = () => { dragging.current = null; setDragId(null); setOverId(null); };
            const moveKey = (fromId, toId) => {
                if (disabled) return;
                const from = entries.findIndex(item => item.id === fromId), to = entries.findIndex(item => item.id === toId);
                if (from < 0 || to < 0 || from === to) return;
                const next = [...entries];
                next.splice(to, 0, next.splice(from, 1)[0]);
                // The adapter falls back to the first key. Preserve that effective
                // default when a purely visual reorder would otherwise change it.
                if (next[0].id !== entries[0].id && !entries.some(item => item.id === defaultId)) onDefault(entries[0].id);
                onChange(next);
            };
            return h("div", { className: c.field, "data-named-keys": true },
                h("span", { className: c.fieldLabel }, t("additionalKeys")),
                h("p", { className: c.advancedHint }, t("additionalKeysHint")),
                ...entries.map((entry, index) => h("div", { key: entry.id, className: `${c.modelEntry} zGbnIq_namedKey${dragId === entry.id ? " dragging" : ""}${overId === entry.id && dragId !== entry.id ? " drag-over" : ""}`,
                    onDragOver: event => { if (disabled || !dragging.current) return; event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOverId(entry.id); },
                    onDrop: event => { if (disabled || !dragging.current) return; event.preventDefault(); event.stopPropagation(); moveKey(dragging.current, entry.id); endDrag(); }
                },
                    h("button", { type: "button", className: "zGbnIq_keyDrag", disabled: disabled || entries.length < 2, draggable: !disabled && entries.length > 1,
                        title: t("keyReorder"), "aria-label": `${t("keyReorder")} · ${entry.name}`,
                        onDragStart: event => { if (disabled) { event.preventDefault(); return; } event.stopPropagation(); dragging.current = entry.id; setDragId(entry.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-dsh-named-key", entry.id); event.dataTransfer.setDragImage(event.currentTarget.parentElement, 20, 20); },
                        onDragEnd: endDrag,
                        onKeyDown: event => { if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return; event.preventDefault(); const next = entries[index + (event.key === "ArrowUp" ? -1 : 1)]; if (next) moveKey(entry.id, next.id); }
                    }, "⠿"),
                    h("input", { className: c.input, value: entry.name, disabled, "aria-label": `${t("keyName")} ${index + 1}`, placeholder: t("keyName"),
                        onChange: (event) => onChange(entries.map((item) => item.id === entry.id ? { ...item, name: event.target.value } : item)) }),
                    h("input", { className: c.input, type: "password", autoComplete: "off", spellCheck: false,
                        value: values[entry.id] ?? "", disabled: disabled || states[entry.id]?.writable === false,
                        "aria-label": `${t("keyInput")} ${index + 1}`,
                        placeholder: states[entry.id]?.configured ? t("keyStored") : t("keyPlaceholder"),
                        onChange: (event) => onValue(entry.id, event.target.value) }),
                    h("button", { type: "button", className: c.linkButton, disabled: disabled || usedIds.has(entry.id),
                        title: usedIds.has(entry.id) ? t("keyInUse") : t("removeKey"),
                        onClick: () => { onChange(entries.filter((item) => item.id !== entry.id)); onValue(entry.id, ""); } }, t("removeKey")),
                    usedIds.has(entry.id) ? h("span", { className: c.advancedHint, style: { gridColumn: "1 / -1", marginTop: -4 } }, t("keyInUse")) : null)),
                h("button", { type: "button", className: c.addModelButton, disabled, onClick: () => {
                    const id = `key-${crypto.randomUUID()}`;
                    onChange([...entries, { id, name: `${t("keyName")} ${entries.length + 1}`, credentialRef: `DSH_KEY_${id.slice(4).replaceAll("-", "").toUpperCase()}` }]);
                } }, t("addKey")));
        }
		function ProviderEditor(props) {
			const { namespace, schema, settingsPath, operations, t } = props;
			const [draft, setDraft] = (0, react.useState)(() => draftAt(schema, namespace, settingsPath));
			const [editorPane, setEditorPane] = (0, react.useState)("keys");
			const [keyDraft, setKeyDraft] = (0, react.useState)("");
			const [keyState, setKeyState] = (0, react.useState)(void 0);
            const [keyValues, setKeyValues] = react.useState({});
            const [keyStates, setKeyStates] = react.useState({});
			const [busy, setBusy] = (0, react.useState)(false);
			const [listBusy, setListBusy] = (0, react.useState)(false);
			const { onBusyChange } = props;
			(0, react.useEffect)(() => {
				onBusyChange?.(busy || listBusy);
			}, [
				busy,
				listBusy,
				onBusyChange
			]);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [committedOriginal, setCommittedOriginal] = (0, react.useState)(() => schema.getPath(namespace.user, settingsPath));
			const [expectedRevision, setExpectedRevision] = (0, react.useState)(() => namespace.revision);
			const root = (0, react.useMemo)(() => schema.rehydrate(namespace.schema), [namespace.schema, schema]);
			const node = (0, react.useMemo)(() => schema.nodeAtPath(root, settingsPath), [
				root,
				schema,
				settingsPath
			]);
			const fallback = schema.getPath(namespace.value, settingsPath);
			const providerEnabled = (schema.getPath(draft, ["enabled"]) ?? schema.getPath(fallback, ["enabled"])) !== false;
			const disabled = props.readOnly || busy || listBusy;
			const accountProvider = props.provider === "deepseek-account";
			const layout = accountProvider ? "deepseek" : layoutOf(namespace.ns);
			const keyRef = refFor(schema, namespace, settingsPath, props.provider);
			const protocols = (0, react.useMemo)(() => layout === "pi-ai" ? protocolChoices(namespace, schema) : [], [
				layout,
				namespace,
				schema
			]);
			(0, react.useEffect)(() => {
				if (accountProvider) return;
				let stale = false;
				setKeyState(void 0);
				operations.describeCredential(keyRef).then((described) => {
					if (stale) return;
					setKeyState(described);
				});
				return () => {
					stale = true;
				};
			}, [
				operations,
				keyRef,
				accountProvider
			]);
			const stringAt = (source, key) => {
				const value = schema.getPath(source, [key]);
				return typeof value === "string" && value.trim().length > 0 ? value : void 0;
			};
			const setField = (key, next) => {
				const value = next === void 0 || next.trim().length === 0 ? void 0 : next;
				setDraft((current) => value === void 0 ? schema.deletePath(current, [key]) : schema.setPath(current, [key], value));
			};
			const modelFailure = validateDeepSeekModels(prepareModelEntries(schema.getPath(draft, ["models"])));
			const keyFailure = apiKeyFailure(keyDraft);
			const keyValue = keyDraft.trim();
			const storedApiKeys = layout === "pi-ai" ? schema.getPath(draft, ["apiKeys"]) ?? schema.getPath(fallback, ["apiKeys"]) : void 0;
			// Older profiles stored one credential in apiKeyEnv. Surface it as a
			// named default entry so upgrading the UI never hides an existing key.
			const apiKeyDrafts = layout === "pi-ai" ? (Array.isArray(storedApiKeys) && storedApiKeys.length > 0 ? storedApiKeys : (keyRef ? [{ id: "legacy-default", name: "默认密钥", credentialRef: keyRef }] : [])) : [];
			const configuredDefaultId = schema.getPath(draft, ["activeApiKey"]) ?? schema.getPath(fallback, ["activeApiKey"]);
			const defaultKeyId = apiKeyDrafts.find((entry) => entry.id === configuredDefaultId)?.id ?? apiKeyDrafts[0]?.id;
            const usedKeyIds = new Set([
                ...modelDrafts(schema.getPath(draft, ["models"]) ?? schema.getPath(fallback, ["models"])).map((model) => effectiveModelKeyId(model, apiKeyDrafts, defaultKeyId)),
                ...Object.values(schema.getPath(draft, ["modelOverrides"]) ?? schema.getPath(fallback, ["modelOverrides"]) ?? {}).map((model) => effectiveModelKeyId(model, apiKeyDrafts, defaultKeyId)),
                defaultKeyId
            ].filter(Boolean));
            const refsSignature = JSON.stringify(apiKeyDrafts.map(({ id, credentialRef }) => ({ id, credentialRef })).sort((a, b) => a.id.localeCompare(b.id)));
            react.useEffect(() => {
                let stale = false;
                Promise.all(JSON.parse(refsSignature).map(async (entry) => [entry.id, await operations.describeCredential(entry.credentialRef)]))
                    .then((results) => { if (!stale) setKeyStates(Object.fromEntries(results)); })
                    .catch(() => { if (!stale) setKeyStates({}); });
                return () => { stale = true; };
            }, [operations, refsSignature]);
			const namedKeyFailure = layout !== "pi-ai" ? void 0 : (() => {
                const names = new Set();
                for (const entry of apiKeyDrafts) {
                    const name = entry.name.trim();
                    if (!name || names.has(name)) return t("keyNameInvalid");
                    names.add(name);
                    const value = keyValues[entry.id] ?? "";
                    const issue = apiKeyFailure(value);
                    if (issue) return `${name}: ${t(issue)}`;
                    // Empty newly-added rows are allowed while editing; validation runs when a value is entered.
                }
                if ([...usedKeyIds].some((id) => !apiKeyDrafts.some((entry) => entry.id === id))) return t("keyUnavailable");
            })();
			const shownKeyFailure = (props.credentialRequired === true && keyDraft.length > 0 && keyValue.length === 0 ? "keyRequired" : void 0) ?? keyFailure;
			const probeApi = stringAt(draft, "api") ?? stringAt(fallback, "api");
			const probeBaseURL = stringAt(draft, "baseURL") ?? stringAt(fallback, "baseURL");
			const probe = {
				settingsNs: namespace.ns,
				provider: props.provider,
				...probeBaseURL === void 0 ? {} : { baseURL: probeBaseURL },
				...probeApi === void 0 ? {} : { api: probeApi },
				...keyValue.length === 0 ? {} : { apiKey: keyValue }
			};
			/**
			* The write for this card, or a failure message. Every edit travels as
			* path ops against the STORED section: the draft comes from the redacted
			* descriptor, so a wholesale replace rebuilt from it could delete fields
			* outside the card. Ops name only the fields this card can see.
			*/
			const applyOnce = async () => {
				const ns = namespace.ns;
				let next = layout === "pi-ai" && stringAt(draft, "apiKeyEnv") === void 0 && stringAt(fallback, "apiKeyEnv") === void 0 && keyValue.length > 0 ? schema.setPath(draft, ["apiKeyEnv"], keyRef) : draft;
				if (namedKeyFailure) return namedKeyFailure;
                // Credentials are stored before publishing references to them. A retry is safe.
                for (const entry of apiKeyDrafts) {
                    const value = (keyValues[entry.id] ?? "").trim();
                    if (!value) continue;
                    const stored = await operations.storeCredential(entry.credentialRef, value);
                    if (stored !== void 0) return stored;
                }
				if (props.credentialOnly !== true) {
					if (layout === "pi-ai") {
						next = fixedModelKeyProfile(next, fallback, apiKeyDrafts, defaultKeyId);
						if (Array.isArray(next.models)) next = schema.setPath(next, ["models"], prepareModelEntries(next.models));
					}
					const failure = validateDeepSeekModels(schema.getPath(next, ["models"]));
					/* v8 ignore next 3 -- unreachable from the card: the same failure disables submit */
					if (failure !== void 0) return `${t("model")} ${String(failure.index + 1)}: ${t(failure.key)}`;
				}
				/* v8 ignore next -- apply is only reachable from the rendered card, which required a resolved node */
				if (props.credentialOnly !== true && node !== void 0 && settingsPath.length === 0) {
					const sectionError = schema.validate(node, next);
					if (sectionError !== void 0) return sectionError;
				}
				const materializesNativeProfile = layout === "pi-ai" && fallback === void 0 && committedOriginal === void 0 && Object.keys(next).length === 0;
				const ops = props.credentialOnly === true ? [] : materializesNativeProfile ? [{
					op: "set",
					path: [...settingsPath],
					value: {}
				}] : pathOps(settingsPath, committedOriginal, next);
				if (ops.length > 0) {
					const written = await operations.writeSettings(ns, ops, expectedRevision);
					if (written.kind !== "written") return written.kind === "conflict" ? t("conflict") : written.message;
					setCommittedOriginal(schema.getPath(written.view.user, settingsPath));
					setExpectedRevision(written.view.revision);
					setDraft(next);
				}
                if (keyValue.length > 0) {
                    const stored = await operations.storeCredential(keyRef, keyValue);
                    if (stored !== void 0) return stored;
                }
                setKeyValues({});
				setKeyDraft("");
			};
			const apply = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					const failure = await applyOnce();
					if (failure !== void 0) {
						setFailure(failure);
						return;
					}
					props.onClose(true);
				} finally {
					setBusy(false);
				}
			};
			if (node === void 0) return (0, react_jsx_runtime.jsxs)("p", {
				className: ModelsSection_module_css_default["error"],
				children: [
					props.provider,
					": ",
					props.t("settingsPathUnresolvable")
				]
			});
			const keyLocked = keyState?.writable === false;
			/**
			* The catalog beneath the user layer: what the composition entry pinned, or
			* else the schema default that `resolve` would supply. The effective value
			* cannot answer this — it still carries the stored override until the unset
			* is applied, so reading it would echo that override straight back the
			* moment reset drops it, leaving the rows unchanged until a reload.
			*/
			const inheritedModels = () => {
				return schema.getPath(namespace.base, [...settingsPath, "models"]) ?? schema.nodeAtPath(root, [...settingsPath, "models"])?.meta.default;
			};
			/**
			* The curated fields of one known adapter family. The family arrives
			* narrowed so the per-family branches below are total: an unknown namespace
			* renders the hint instead and never reaches this body.
			*/
			const curatedFields = (family) => {
				const ownsIdentity = family === "pi-ai" && props.declared === true;
				const customModels = schema.getPath(draft, ["models"]);
				const modelsOverridden = schema.hasPath(draft, ["models"]);
				const models = modelDrafts(modelsOverridden ? customModels : inheritedModels());
				const defaultContextWindow = schema.getPath(fallback, ["defaultContextWindow"]);
				const defaultMaxTokens = schema.getPath(fallback, ["maxTokens"]);
				const defaultInput = schema.getPath(fallback, ["defaultInput"]);
				const keyPlaceholder = keyLocked ? t("keyEnvLocked") : keyState?.configured === true && props.credentialRequired !== true ? t("keyStored") : family === "pi-ai" ? t("keyPlaceholderNative") : t("keyPlaceholder");
				/** What both family editors take: the rows, whose layer owns them, and the two writes. */
				const catalogProps = {
                    onBusyChange: setListBusy,
					apiKeys: family === "pi-ai" ? apiKeyDrafts : void 0,
					defaultApiKey: family === "pi-ai" ? defaultKeyId : void 0,
					keyValues: family === "pi-ai" ? keyValues : void 0,
					keyStates: family === "pi-ai" ? keyStates : void 0,
					models,
					overridden: modelsOverridden,
					t,
					disabled,
					onChange: (next) => {
						setDraft((current) => schema.setPath(current, ["models"], next));
					},
					onReset: () => {
						setDraft((current) => schema.deletePath(current, ["models"]));
					}
				};
				if (accountProvider) return (0, react_jsx_runtime.jsx)(DeepSeekModelsEditor, {
					...catalogProps,
					defaultContextWindow: typeof defaultContextWindow === "number" ? defaultContextWindow : void 0,
					defaultMaxTokens: typeof defaultMaxTokens === "number" ? defaultMaxTokens : void 0
				});
				const balanceFields = props.credentialOnly === true ? null : react.createElement(BalanceQuerySettings, {
					provider: props.provider,
					displayName: props.displayName,
					profile: schema.getPath(namespace.value, settingsPath),
					disabled: props.readOnly,
					t
				});
				const keyFields = (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					family === "pi-ai" ? null : ((0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["field"],
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("keyInput")
						}),
						(0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "password",
							autoComplete: "new-password",
							value: keyDraft,
							placeholder: keyPlaceholder,
							"aria-label": t("keyInput"),
							"aria-invalid": shownKeyFailure !== void 0,
							required: props.credentialRequired === true,
							autoFocus: props.autoFocusCredential === true,
							disabled: disabled || keyLocked,
							onChange: (event) => {
								setKeyDraft(event.target.value);
							}
						}),
						shownKeyFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
							className: ModelsSection_module_css_default["error"],
							children: t(shownKeyFailure)
						})
					]
				})), family === "pi-ai" && props.credentialOnly !== true ? react.createElement(NamedKeysEditor, {
                    entries: apiKeyDrafts, values: keyValues, states: keyStates, usedIds: usedKeyIds, disabled, t,
                    defaultId: defaultKeyId,
                    onDefault: (id) => setDraft((current) => schema.setPath(current, ["activeApiKey"], id ?? "")),
                    onChange: (entries) => setDraft((current) => {
                        const next = schema.setPath(current, ["apiKeys"], entries);
                        return defaultKeyId && entries.some((entry) => entry.id === defaultKeyId) ? schema.setPath(next, ["activeApiKey"], defaultKeyId) : next;
                    }),
                    onValue: (id, value) => setKeyValues((current) => ({ ...current, [id]: value }))
                }) : null, namedKeyFailure ? react.createElement("p", { className: ModelsSection_module_css_default.error }, namedKeyFailure) : null] });
				const customFields = props.credentialOnly === true || !ownsIdentity ? null : (0, react_jsx_runtime.jsxs)("section", {
					className: ModelsSection_module_css_default["customized"],
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: ModelsSection_module_css_default["fieldLabel"],
						children: t("customized")
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["customizedBody"],
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["field"],
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["fieldLabel"],
									children: t("customDisplayName")
								}), (0, react_jsx_runtime.jsx)("input", {
									className: ModelsSection_module_css_default["input"],
									type: "text",
									value: stringAt(draft, "displayName") ?? "",
									placeholder: stringAt(schema.getPath(namespace.base, settingsPath), "displayName") ?? props.provider,
									"aria-label": t("customDisplayName"),
									disabled,
									onChange: (event) => {
										setField("displayName", event.target.value);
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["field"],
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelsSection_module_css_default["fieldLabel"],
										children: t("baseUrl")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: stringAt(draft, "baseURL") ?? "",
										placeholder: family === "deepseek" ? t("deepSeekBaseUrl") : stringAt(fallback, "baseURL") ?? t("baseUrlDefault"),
										"aria-describedby": family === "deepseek" ? `${props.provider}-endpoint-hint` : void 0,
										"aria-label": t("baseUrl"),
										disabled,
										onChange: (event) => {
											setField("baseURL", event.target.value === "" ? void 0 : event.target.value);
										}
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["field"],
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["fieldLabel"],
									children: t("customApi")
								}), (0, react_jsx_runtime.jsxs)("select", {
									className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
									value: probeApi ?? "",
									"aria-label": t("customApi"),
									disabled,
									onChange: (event) => {
										setField("api", event.target.value);
									},
									children: [probeApi === void 0 ? (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("customApiUnset")
									}) : null, protocols.map((choice) => (0, react_jsx_runtime.jsx)("option", {
										value: choice,
										children: protocolLabel(t, choice)
									}, choice))]
								})]
							})
						]
					})]
				});
				const officialSettings = props.credentialOnly === true || ownsIdentity ? null : (0, react_jsx_runtime.jsxs)("section", {
					className: ModelsSection_module_css_default["customized"],
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: ModelsSection_module_css_default["fieldLabel"],
						children: t("customized")
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["customizedBody"],
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["field"],
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelsSection_module_css_default["fieldLabel"],
										children: t("baseUrl")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										value: stringAt(draft, "baseURL") ?? "",
										placeholder: family === "deepseek" ? t(stringAt(fallback, "protocol") === "messages" ? "deepSeekMessagesBaseUrl" : "deepSeekChatBaseUrl") : stringAt(fallback, "baseURL") ?? t("baseUrlDefault"),
										"aria-describedby": family === "deepseek" ? `${props.provider}-endpoint-hint` : void 0,
										"aria-label": t("baseUrl"),
										disabled,
										onChange: (event) => {
											setField("baseURL", event.target.value === "" ? void 0 : event.target.value);
										}
									}),
									family === "deepseek" ? (0, react_jsx_runtime.jsx)("span", {
										id: `${props.provider}-endpoint-hint`,
										className: ModelsSection_module_css_default["advancedHint"],
										children: t("deepSeekEndpointHint")
									}) : null
								]
							})
						]
					})]
				});
				const modelFields = props.credentialOnly === true ? null : family === "deepseek" ? (0, react_jsx_runtime.jsx)(DeepSeekModelsEditor, {
					...catalogProps,
					defaultContextWindow: typeof defaultContextWindow === "number" ? defaultContextWindow : void 0,
					defaultMaxTokens: typeof defaultMaxTokens === "number" ? defaultMaxTokens : void 0
				}) : (0, react_jsx_runtime.jsx)(ModelListEditor, {
					...catalogProps,
					probe,
					probeBlocked: keyFailure,
					operations
				});
				return { keyFields: officialSettings ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [keyFields, officialSettings] }) : keyFields, customFields, modelFields, balanceFields, customizable: ownsIdentity };
			};
			const curated = layout === "unknown" ? void 0 : curatedFields(layout);
			(0, react.useEffect)(() => {
				if (curated?.customizable !== true && editorPane === "custom") setEditorPane("keys");
			}, [curated?.customizable, editorPane]);
            if (accountProvider) return curated;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: props.credentialOnly === true ? ModelsSection_module_css_default["addBlock"] : ModelsSection_module_css_default["editor"],
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "zGbnIq_editorScroll",
						children: [
							props.hideTitle === true ? null : (0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["editorHeader"],
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["editorTitle"],
									children: props.displayName
								}), props.provider !== props.displayName ? (0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["editorRoute"],
									children: props.provider
								}) : null]
							}),
							layout === "unknown" ? (0, react_jsx_runtime.jsx)("p", {
								className: ModelsSection_module_css_default["advancedHint"],
								children: `${t("advancedHint")} (${namespace.ns})`
							}) : props.credentialOnly === true ? curated.keyFields : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								layout === "pi-ai" && react.createElement("div", { className: "zGbnIq_providerEnable" },
									react.createElement("div", null, react.createElement("strong", null, t("providerEnabled")), react.createElement("p", null, t(providerEnabled ? "providerEnabledHint" : "providerDisabledHint"))),
									react.createElement("button", { type: "button", role: "switch", className: "zGbnIq_providerSwitch", "aria-label": t("providerEnabled"), "aria-checked": providerEnabled, disabled, onClick: () => setDraft(current => schema.setPath(current, ["enabled"], !providerEnabled)) })),
								(0, react_jsx_runtime.jsxs)("div", {
									className: ModelsSection_module_css_default["editorTabs"],
									role: "tablist",
									"aria-label": t("editorSections"),
									children: [
										curated.customizable === true ? (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											className: ModelsSection_module_css_default["editorTab"],
											"aria-selected": editorPane === "custom",
											onClick: () => setEditorPane("custom"),
											children: t("customSection")
										}) : null,
										(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											className: ModelsSection_module_css_default["editorTab"],
											"aria-selected": editorPane === "keys",
											onClick: () => setEditorPane("keys"),
											children: t("keysSection")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											className: ModelsSection_module_css_default["editorTab"],
											"aria-selected": editorPane === "models",
											onClick: () => setEditorPane("models"),
											children: t("modelsSection")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											className: ModelsSection_module_css_default["editorTab"],
											"aria-selected": editorPane === "balance",
											onClick: () => setEditorPane("balance"),
											children: t("balanceSection")
										})
									]
								}),
								editorPane === "models" ? curated.modelFields : editorPane === "custom" && curated.customizable === true ? curated.customFields : editorPane === "balance" ? curated.balanceFields : curated.keyFields
							] }),
							failure !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: ModelsSection_module_css_default["error"],
								children: failure
							}) : null,
							props.credentialOnly === true || modelFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								className: ModelsSection_module_css_default["advancedHint"],
								children: `${t("model")} ${String(modelFailure.index + 1)}: ${t(modelFailure.key)}`
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(EditorFooter, {
						t,
						busy,
						submitDisabled: disabled || namedKeyFailure !== void 0 || layout === "unknown" || props.credentialOnly !== true && modelFailure !== void 0 || shownKeyFailure !== void 0 || props.credentialRequired === true && keyValue.length === 0,
						submitLabelKey: props.submitLabelKey ?? "apply",
						submitBusyLabelKey: props.submitBusyLabelKey ?? "applying",
						...props.cancelLabelKey === void 0 ? {} : { cancelLabelKey: props.cancelLabelKey },
						onCancel: () => {
							props.onClose(false);
						},
						onSubmit: () => {
							props.onSubmitCredential?.();
							apply();
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/ModelsSection.js
		/**
		* Models settings section: the provider rows joined from the configurable
		* directory, settings namespaces, and credential states, with one editor
		* card at a time. Rows retain the account-first order supplied by the store
		* and expose only confirmed API-key state through accessible
		* solid configured or missing dots. A whole-section provider without a
		* configured key renders as its open setup card instead of a row, but only in
		* the first-run posture — no provider on the page can serve requests yet — and
		* only until the user closes that card. The add flow is one card behind one
		* button: a mode switch chooses between adopting a dormant directory provider
		* (the catalog select over the provider editor) and declaring a custom model
		* API (the create form). A panel mounts the first time its mode is shown and
		* stays mounted, hidden, while the card is open and its mode stays offered,
		* so switching modes discards neither draft and an unvisited mode costs
		* nothing; the switch holds still while either panel has a write or an
		* endpoint interrogation in flight, since a switch underneath one would
		* orphan the answer. Each card kind owns its own open state, so closing one
		* never discards a draft in another. Every
		* mutation writes through the wire, while a provider removal first requires
		* confirmation; the page re-renders from pushed invalidations or the
		* post-apply reload.
		*/
		/** Render an editor for either the setup posture or an expanded provider row. */
		function renderProviderEditor({ target, ...props }) {
			return (0, react_jsx_runtime.jsx)(ProviderEditor, {
				provider: target.provider,
				displayName: target.displayName,
				settingsPath: target.settingsPath,
				...target.declared === true ? { declared: true } : {},
				...props
			});
		}
		/**
		* Remove one user-added provider and its page-managed credential. Credential
		* removal comes first so a second-step failure leaves the provider row visible
		* and the whole operation safely retryable; both unsets are idempotent.
		* The settings removal names the profile rather than rebuilding its whole
		* namespace from a partial view.
		* @param operations - the page's Host operations.
		* @param controller - the page store to refresh.
		* @param target - the provider's settings address and optional managed credential.
		* @returns the failure message, or undefined once the write and reload landed.
		*/
		async function removeProviderProfile(operations, controller, target) {
			if (target.credentialRef !== void 0) {
				const credential = await operations.removeCredential(target.credentialRef);
				if (credential !== void 0) return credential;
			}
			const written = await operations.writeSettings(target.settingsNs, [{
				op: "unset",
				path: [...target.settingsPath]
			}], void 0);
			if (written.kind !== "written") return written.message;
			await controller.load();
		}
		/**
		* Whether a whole-section provider still needs its first key: an unconfigured
		* credential opens the setup card instead of showing a row. This is the
		* first-run posture alone — a user who can already reach some provider gets an
		* ordinary row with the missing-key dot, since nothing here is blocking them.
		* @param row - the joined provider row.
		* @param anyUsable - whether any joined row can already serve requests.
		* @returns whether to render the setup card.
		*/
		function needsSetup(row, anyUsable) {
			if (anyUsable || row.entry.provider === "deepseek-account") return false;
			if (row.entry.settingsPath.length > 0) return false;
			return row.credential?.configured !== true;
		}
		/**
		* The provider-card seat's credential fact: the reference this page would use
		* for the row — the profile's `apiKeyEnv`, or the page's derived
		* `<ROUTE>_API_KEY` while the profile names none — confirmed configured. The
		* derived half is what keeps the seat consistent with the editor on the
		* add-provider draft, whose dormant row names no reference yet.
		*/
		function keyConfiguredOf(row) {
			return row.apiKeyEnv !== void 0 ? row.credential?.configured === true : row.derivedCredential?.configured === true;
		}
		function targetOf(row) {
			const managedRef = deriveKeyRef(row.entry.provider);
			const credentialRef = row.apiKeyEnv === managedRef && row.credential?.configured === true && row.credential.writable ? managedRef : void 0;
			return {
				provider: row.entry.provider,
				displayName: row.entry.displayName,
				settingsNs: row.entry.settingsNs,
				settingsPath: row.entry.settingsPath,
				...credentialRef === void 0 ? {} : { credentialRef },
				...row.entry.declared === true ? { declared: true } : {}
			};
		}
		/** Stable visible and accessible identity for one provider target. */
		function providerTargetLabel(target) {
			return target.provider === target.displayName ? target.provider : `${target.displayName} (${target.provider})`;
		}
		/** Replace the one provider placeholder in localized destructive-action copy. */
		function providerCopy(template, target) {
			return template.replace("{provider}", () => providerTargetLabel(target));
		}
		/**
		* Render the Models section content column.
		* @param props - slot-delivered injected dependencies.
		* @returns the section, or null while the shell has not injected yet.
		*/
		function ModelsSection(props) {
			const { controller, useSnapshot, operations, schema, t, renderSlot } = props;
			if (controller === void 0 || useSnapshot === void 0 || operations === void 0 || schema === void 0 || t === void 0) return null;
			return (0, react_jsx_runtime.jsx)(Loaded, {
				injected: {
					controller,
					useSnapshot,
					operations,
					schema,
					t
				},
				renderSlot
			});
		}
		// Match resolveProfiles: a named default, otherwise the first named key;
		// old single-key providers keep their original credential reference.
		function providerKeyGroups(row, namespace, schema, t) {
			const profile = schema.getPath(namespace.value, row.entry.settingsPath) ?? {};
			/* Official DeepSeek now also stores named keys; the Host rejects a
			   stale `legacy-default` id with `reason: changed`, which hid the
			   balance row. Read apiKeys for every family that has them. */
			if (Array.isArray(profile.apiKeys) && profile.apiKeys.length) {
				const entries = profile.apiKeys.map((entry) => ({ id: entry.id, name: entry.name || entry.id, credentialRef: entry.credentialRef ?? profile.apiKeyEnv }));
				const current = entries.find((entry) => entry.id === profile.activeApiKey) ?? entries[0];
				return { entries, current };
			}
			const current = { id: "legacy-default", name: keyConfiguredOf(row) ? t("groupDefault") : t("groupUnconfigured") };
			return { entries: [current], current };
		}
		function ProviderKeyGroup({ row, namespace, schema, t }) {
			const h = react.createElement;
			const { entries, current } = providerKeyGroups(row, namespace, schema, t);
			const credentialState = row.credential?.configured === true ? "Configured" : row.apiKeyEnv !== void 0 && row.credential?.configured === false ? "Missing" : "Unknown";
			return h("div", { className: "zGbnIq_keyGroup" },
				h("span", { className: `zGbnIq_credentialDot zGbnIq_credentialDot${credentialState}`, role: "img", "aria-label": t(`credential${credentialState}`), title: t(`credential${credentialState}`) }),
				h("span", { className: "zGbnIq_keyGroupBadge", title: entries.map((entry) => entry.name).join(" · ") },
					entries.length > 1 ? `${t("providerKeyLabel")} · ${entries.length} · ${t("modelKeyFixed")}` : `${t("providerKeyLabel")} · ${current.name}`));
		}
		const SPEND_HISTORY_KEY = "dsh.local.balanceHistory.v1";
		const spendRound = (value) => Math.round(Number(value) * 100) / 100;
		const spendDay = (at = Date.now()) => {
			const d = new Date(at);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		};
		const spendFromReadings = (previous, next) => {
			if (!next) return 0;
			if (previous?.unit && next.unit && previous.unit !== next.unit) return 0;
			if (typeof next.used === "number" && typeof previous?.used === "number" && next.used >= previous.used - 1e-9) return spendRound(Math.max(0, next.used - previous.used));
			if (typeof next.remaining === "number" && typeof previous?.remaining === "number" && next.remaining <= previous.remaining + 1e-9) return spendRound(Math.max(0, previous.remaining - next.remaining));
			return 0;
		};
		const summarizeSpend = (entry, limit = 14) => {
			const days = entry?.days && typeof entry.days === "object" ? entry.days : {};
			const today = spendDay();
			const list = Object.keys(days).sort().reverse().slice(0, limit).map((date) => ({
				date,
				amounts: Object.entries(days[date] || {}).filter(([, spend]) => Number(spend) > 0).map(([unit, spend]) => ({ unit, spend: spendRound(spend) }))
			})).filter((row) => row.amounts.length > 0);
			const todayAmounts = Object.entries(days[today] || {}).filter(([, spend]) => Number(spend) > 0).map(([unit, spend]) => ({ unit, spend: spendRound(spend) }));
			return { today: todayAmounts, days: list };
		};
		const spendStoreKey = (provider, key) => `${provider}\t${key}`;
		const readSpendStore = () => {
			try { return JSON.parse(localStorage.getItem(SPEND_HISTORY_KEY) || "{}") || {}; } catch { return {}; }
		};
		// Both sources measure the same consumption. Keep the larger known daily
		// amount per currency, never add overlapping samples or erase older days.
		const mergeSpendHistory = (...histories) => {
			const days = {};
			for (const history of histories) {
				for (const row of [...(history?.days || []), { date: spendDay(), amounts: history?.today || [] }]) {
					if (!/^\d{4}-\d{2}-\d{2}$/.test(row?.date)) continue;
					for (const amount of row.amounts || []) {
						if (typeof amount.unit !== "string" || !Number.isFinite(amount.spend) || amount.spend < 0) continue;
						const units = days[row.date] ||= {};
						units[amount.unit] = Math.max(Number(units[amount.unit]) || 0, amount.spend);
					}
				}
			}
			return summarizeSpend({ days }, Infinity);
		};
		const persistSpendHistory = (provider, key, history) => {
			const store = readSpendStore(), id = spendStoreKey(provider, key);
			const current = store[id] || {};
			const merged = mergeSpendHistory(summarizeSpend(current, Infinity), current.snapshot, history);
			store[id] = { ...current, snapshot: { days: merged.days } };
			try { localStorage.setItem(SPEND_HISTORY_KEY, JSON.stringify(store)); } catch {}
			window.dispatchEvent(new CustomEvent("harness-balance-history-updated", { detail: { provider, key } }));
			return merged;
		};
		const recordLocalSpend = (provider, key, balances, now = Date.now(), history) => {
			const store = readSpendStore();
			const id = spendStoreKey(provider, key);
			const current = store[id] && typeof store[id] === "object" ? store[id] : { last: null, days: {} };
			if (current.last?.at >= now) return persistSpendHistory(provider, key, history);
			const readings = (Array.isArray(balances) ? balances : []).map((item) => ({
				used: typeof item?.used === "number" ? item.used : null,
				remaining: typeof item?.remaining === "number" ? item.remaining : null,
				unit: typeof item?.unit === "string" && item.unit ? item.unit : ""
			})).filter((item) => item.used != null || item.remaining != null);
			const day = spendDay(now);
			const days = { ...(current.days && typeof current.days === "object" ? current.days : {}) };
			if (!days[day] || typeof days[day] !== "object") days[day] = {};
			const previousReadings = Array.isArray(current.last?.readings) ? current.last.readings : [];
			for (const reading of readings) {
				const previous = previousReadings.find((item) => item.unit === reading.unit);
				const spend = spendFromReadings(previous, reading);
				if (spend > 0) days[day][reading.unit] = spendRound((Number(days[day][reading.unit]) || 0) + spend);
			}
			store[id] = { ...current, last: { at: now, readings }, days };
			try { localStorage.setItem(SPEND_HISTORY_KEY, JSON.stringify(store)); } catch {}
			return persistSpendHistory(provider, key, mergeSpendHistory(summarizeSpend(store[id], Infinity), history));
		};
		const loadLocalSpend = (provider, key) => {
			const entry = readSpendStore()[spendStoreKey(provider, key)];
			return mergeSpendHistory(summarizeSpend(entry, Infinity), entry?.snapshot);
		};
		const formatSpendAmounts = (amounts) => (amounts?.length ? amounts.map((item) => `${Number(item.spend).toFixed(2)} ${item.unit}`).join(" · ") : "0.00");
		const spendSeries = (history, length = 7) => {
			const byDate = new Map();
			for (const row of history?.days || []) byDate.set(row.date, row.amounts || []);
			if (Array.isArray(history?.today)) byDate.set(spendDay(), history.today);
			const series = [];
			for (let i = length - 1; i >= 0; i--) {
				const d = new Date();
				d.setHours(12, 0, 0, 0);
				d.setDate(d.getDate() - i);
				const date = spendDay(d.getTime());
				const amounts = byDate.get(date) || [];
				series.push({ date, amounts, spend: spendRound(amounts.reduce((sum, item) => sum + Number(item.spend || 0), 0)) });
			}
			return series;
		};
		const spendDayLabel = (date, t) => {
			if (date === spendDay()) return t("spendToday");
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			if (date === spendDay(yesterday.getTime())) return t("spendYesterday");
			const parts = date.split("-");
			return `${Number(parts[1])}/${Number(parts[2])}`;
		};
		function SpendChart({ history, t }) {
			const h = react.createElement;
			const series = spendSeries(history, 7);
			const max = Math.max(1, ...series.map((row) => row.spend));
			const unit = series.flatMap((row) => row.amounts).find((item) => item?.unit)?.unit || "";
			const w = 560, ht = 168, padX = 22, padTop = 16, padBottom = 28;
			const innerW = w - padX * 2, innerH = ht - padTop - padBottom;
			const points = series.map((row, i) => {
				const x = padX + (series.length === 1 ? innerW / 2 : i / (series.length - 1) * innerW);
				const y = padTop + innerH - row.spend / max * innerH;
				return { ...row, x, y };
			});
			const line = points.map((p) => `${p.x},${p.y}`).join(" ");
			const area = `${padX},${padTop + innerH} ${line} ${padX + innerW},${padTop + innerH}`;
			const gid = "zGbnIqSpendFill";
			return h("div", { className: "zGbnIq_spendChartWrap" },
				h("svg", { className: "zGbnIq_spendChart", viewBox: `0 0 ${w} ${ht}`, role: "img", "aria-label": t("spendChart") },
					h("defs", null, h("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" },
						h("stop", { offset: "0%", stopColor: "var(--dsw-alias-brand-primary)", stopOpacity: "0.32" }),
						h("stop", { offset: "100%", stopColor: "var(--dsw-alias-brand-primary)", stopOpacity: "0.02" }))),
					...points.map((p) => h("rect", {
						key: `${p.date}-bar`,
						x: p.x - 11,
						y: p.y,
						width: 22,
						height: Math.max(3, padTop + innerH - p.y),
						rx: 5,
						fill: p.date === spendDay() ? "var(--dsw-alias-brand-primary)" : "color-mix(in srgb,var(--dsw-alias-brand-primary) 42%, transparent)"
					})),
					h("polygon", { points: area, fill: `url(#${gid})` }),
					h("polyline", { points: line, fill: "none", stroke: "var(--dsw-alias-label-primary)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.85 }),
					...points.map((p) => h("circle", { key: `${p.date}-dot`, cx: p.x, cy: p.y, r: p.date === spendDay() ? 4.2 : 3, fill: "var(--dsw-alias-label-primary)" })),
					...points.map((p) => h("text", { key: `${p.date}-cap`, x: p.x, y: Math.max(12, p.y - 8), textAnchor: "middle", fill: "var(--dsw-alias-label-secondary)", fontSize: 10 }, p.spend ? p.spend.toFixed(p.spend >= 10 ? 0 : 1) : "")),
					...points.map((p) => h("text", { key: `${p.date}-lab`, x: p.x, y: ht - 8, textAnchor: "middle", fill: "var(--dsw-alias-label-tertiary)", fontSize: 11 }, spendDayLabel(p.date, t)))
				),
				h("div", { className: "zGbnIq_spendTable" }, ...series.map((row) => h("div", { key: row.date, className: "zGbnIq_spendTableRow", "data-today": row.date === spendDay() },
					h("span", null, spendDayLabel(row.date, t)),
					h("span", null, `${row.spend.toFixed(2)}${unit ? ` ${unit}` : ""}`)
				)))
			);
		}
		function usePersonalBalanceEnabled() {
			return react.useSyncExternalStore(
				react.useCallback(notify => { window.addEventListener("dsh-personal-balance-changed", notify); return () => window.removeEventListener("dsh-personal-balance-changed", notify); }, []),
				() => window.__dshPersonalBalanceEnabled !== false
			);
		}
		function BalanceQuerySettings(props) {
			const enabled = usePersonalBalanceEnabled();
			return enabled ? react.createElement(ActiveBalanceQuerySettings, props) : react.createElement("p", { role: "status", style: { fontSize: 13, opacity: .7 } }, "余额与消费已关闭，可在插件 → 星潮工具箱中开启。");
		}
		function ActiveBalanceQuerySettings({ provider, profile, disabled, t }) {
			const h = react.createElement, c = ModelsSection_module_css_default;
			const entries = profile?.apiKeys?.length ? profile.apiKeys : [{ id: "legacy-default", name: "默认密钥" }];
			const [key, setKey] = react.useState(profile?.activeApiKey || entries[0].id);
			const [loaded, setLoaded] = react.useState(null), [draft, setDraft] = react.useState({ type: "auto" });
			const [token, setToken] = react.useState(""), [busy, setBusy] = react.useState(true), [dirty, setDirty] = react.useState(false), [notice, setNotice] = react.useState("");
			const [history, setHistory] = react.useState(() => loadLocalSpend(provider, key));
			react.useEffect(() => {
				const update = event => { if (!event.detail || event.detail.provider === provider && event.detail.key === key) setHistory(loadLocalSpend(provider, key)); };
				window.addEventListener("harness-balance-history-updated", update);
				window.addEventListener("storage", update);
				return () => { window.removeEventListener("harness-balance-history-updated", update); window.removeEventListener("storage", update); };
			}, [provider, key]);
			const endpoint = `/api/provider-balance-settings?${new URLSearchParams({ provider, key })}`;
			react.useEffect(() => {
				const abort = new AbortController();
				setBusy(true); setLoaded(null); setToken(""); setDirty(false); setNotice("");
				setHistory(loadLocalSpend(provider, key));
				fetch(endpoint, { credentials: "same-origin", signal: abort.signal }).then(async response => {
					if (!response.ok) throw new Error(response.status === 404 ? "请重启 Harness 后台服务以启用查询编辑" : "无法读取查询设置");
					const data = await response.json(); if (!abort.signal.aborted) { setLoaded(data); setDraft(data.config); }
				}).catch(error => { if (!abort.signal.aborted) setNotice(error.message); }).finally(() => { if (!abort.signal.aborted) setBusy(false); });
				fetch(`/api/provider-balance-history?${new URLSearchParams({ provider, key })}`, { credentials: "same-origin", signal: abort.signal }).then(async response => {
					if (!response.ok) return;
					const data = await response.json();
					if (!abort.signal.aborted) setHistory(persistSpendHistory(provider, key, data));
				}).catch(() => {});
				return () => abort.abort();
			}, [endpoint, provider, key]);
			const edit = (field, value) => { setDraft(previous => ({ ...previous, [field]: value })); setDirty(true); setNotice(""); };
			const revert = () => {
				if (!loaded || busy) return;
				if (dirty && !window.confirm("放弃尚未保存的余额查询设置？")) return;
				setDraft(loaded.config); setToken(""); setDirty(false); setNotice("");
			};
			const send = async action => {
				if (busy || !loaded || disabled) return;
				setBusy(true); setNotice("");
				try {
					const response = await fetch(endpoint, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, config: draft, token, revision: loaded.revision }), signal: AbortSignal.timeout(18000) });
					const data = await response.json();
					if (!response.ok) throw new Error(data.error || "操作失败");
					if (action === "save") { setLoaded(previous => previous ? { ...previous, config: draft, revision: data.revision ?? previous.revision } : previous); setDirty(false); setToken(""); setNotice("查询设置已保存"); window.dispatchEvent(new Event("harness-balance-settings-updated")); }
					else if (data.status === "ok") {
						setHistory(recordLocalSpend(provider, key, data.balances, data.updatedAt, data.history));
						setNotice("查询成功（查询配置尚未保存）\n" + data.balances.map(v => `已使用：${v.used == null ? "—" : v.used.toFixed(2)}　剩余：${v.remaining.toFixed(2)} ${v.unit}`).join("\n") + (data.historyError ? "\n消费记录写入本地文件失败，当前记录已尝试保留在浏览器。" : ""));
					}
					else setNotice(data.reason === "auth" ? "认证失败，请检查查询凭证和用户 ID" : "查询失败，请检查地址、金额字段和换算设置");
				} catch (error) { setNotice(error.name === "TimeoutError" ? "查询超时，请稍后重试" : error.message); }
				finally { setBusy(false); }
			};
			const locked = busy || disabled;
			const field = (label, name, placeholder, type = "text") => h("label", { className: c.field }, h("span", { className: c.fieldLabel }, label), h("input", { className: c.input, type, value: draft[name] ?? "", placeholder, disabled: locked, "aria-label": label, onChange: e => edit(name, e.target.value) }));
			const select = (label, value, options, onChange) => h("label", { className: c.field }, h("span", { className: c.fieldLabel }, label), h("select", { className: c.input, value, disabled: locked, "aria-label": label, onChange: e => onChange(e.target.value) }, ...options.map(([id, text]) => h("option", { key: id, value: id }, text))));
			const custom = !["auto", "off"].includes(draft.type);
			return h("form", { className: "zGbnIq_queryForm", onSubmit: e => { e.preventDefault(); send("save"); } },
				select("对应密钥", key, entries.map(e => [e.id, e.name || e.id]), value => { if (!dirty || window.confirm("切换密钥会放弃未保存的查询设置，继续？")) setKey(value); }),
				loaded ? h(react.Fragment, null,
					select("查询类型", draft.type, [["auto", "自动（兼容 CC Switch）"], ["deepseek", "DeepSeek 官方余额"], ["newapi", "New API 账户余额"], ["general", "通用余额接口"], ["custom", "自定义 JSON 字段"], ["off", "关闭查询"]], type => {
						let base = ""; try { base = new URL(profile?.baseURL || "https://api.deepseek.com").origin; } catch {}
						const path = type === "deepseek" ? "/user/balance" : type === "newapi" ? "/api/user/self" : "/v1/usage";
						const suggestion = loaded.suggested?.type === type ? loaded.suggested : {};
						setDraft({ type, url: base + path, interval: 300, divisor: type === "newapi" ? 500000 : 1, unit: type === "deepseek" ? "CNY" : "元", auth: type === "newapi" ? "custom" : "apiKey", scope: type === "general" ? "key" : "account", remainingPath: "data.balance", usedPath: "", ...suggestion }); setToken(""); setDirty(true); setNotice("");
					}),
					draft.type === "auto" ? h("p", { className: c.advancedHint }, loaded.suggested?.type ? "已找到自动查询配置。选择对应类型即可带入并编辑；保存后使用本地设置。" : "尚未找到自动配置，请选择查询类型并填写。") : null,
					custom ? h(react.Fragment, null,
						field("查询地址（完整 HTTPS URL）", "url", "https://example.com/api/user/self", "url"),
						select("认证方式", draft.auth, [["apiKey", "使用所选密钥的 API Key"], ["custom", "单独的查询凭证（Bearer）"], ["none", "无需认证"]], value => edit("auth", value)),
						draft.auth === "custom" ? h("label", { className: c.field }, h("span", { className: c.fieldLabel }, "查询凭证"), h("input", { className: c.input, type: "password", autoComplete: "new-password", value: token, disabled: locked, "aria-label": "查询凭证", placeholder: loaded.tokenConfigured ? "已配置；留空保留，输入新值替换" : "粘贴查询令牌，不含 Bearer 前缀", onChange: e => { setToken(e.target.value); setDirty(true); } })) : null,
						draft.type === "newapi" ? field("New API 用户 ID", "userId", "例如 123") : null,
						draft.type === "custom" ? h("div", { className: "zGbnIq_queryGrid" }, field("剩余金额字段", "remainingPath", "data.balance"), field("已使用金额字段（可选）", "usedPath", "data.used")) : null,
						h("div", { className: "zGbnIq_queryGrid" }, draft.type !== "deepseek" ? field("金额单位", "unit", "元 / USD") : null, ["newapi", "custom"].includes(draft.type) ? field("换算除数", "divisor", "500000", "number") : null,
							select("自动刷新", String(draft.interval), [["60", "每 1 分钟"], ["300", "每 5 分钟"], ["600", "每 10 分钟"], ["1800", "每 30 分钟"], ["3600", "每 60 分钟"], ...(![60,300,600,1800,3600].includes(Number(draft.interval)) ? [[String(draft.interval), `每 ${Number(draft.interval) / 60} 分钟`]] : [])], value => edit("interval", Number(value))),
							select("金额范围", draft.scope, [["account", "整个账户"], ["key", "当前密钥额度"]], value => edit("scope", value))),
						h("p", { className: c.advancedHint }, "使用 GET 查询。New API 通常需要账户访问令牌及用户 ID；换算后金额 = 接口数值 ÷ 换算除数。")) : null,
					h("div", { className: c.editorActions }, h("button", { type: "button", className: c.secondaryButton, disabled: locked || draft.type === "off", onClick: () => send("test") }, busy ? "处理中…" : "测试查询"), h("button", { type: "button", className: c.secondaryButton, disabled: locked || !dirty, onClick: revert }, "还原"), h("button", { type: "submit", className: c.primaryButton, disabled: locked || !loaded.writable }, "保存查询"))) : null,
				notice ? h("div", { className: "zGbnIq_queryResult", role: "status" }, notice) : null,
				!loaded && busy ? h("p", { className: c.advancedHint }, "正在读取查询配置…") : null,
				h("section", { className: "zGbnIq_spendHistory", "aria-label": t("spendHistory") },
					h("div", { className: c.fieldLabel }, t("spendHistory")),
					h("p", { className: c.advancedHint }, t("spendHistoryHint")),
					h("div", { className: "zGbnIq_spendToday" }, h("span", { className: c.fieldLabel }, t("spendToday")), h("strong", null, formatSpendAmounts(history?.today))),
					h(SpendChart, { history, t })
				));
		}
		// Memory only; keep readings while settings are reopened or refreshed.
		const providerBalanceReadings = new Map();
		function mergeProviderBalanceReading(previous, next) {
			if (next.status === "error" || next.reason === "changed" || next.reason === "setup" && previous?.balances) return { ...previous, ...next, status: "error", ...(previous?.balances && !next.balances ? { balances: previous.balances, updatedAt: previous.updatedAt, scope: previous.scope } : {}), stale: !!(previous?.balances || next.balances) };
			return next;
		}
		function ProviderBalance(props) {
			return usePersonalBalanceEnabled() ? react.createElement(ActiveProviderBalance, props) : null;
		}
		function ActiveProviderBalance({ row, namespace, schema, t }) {
			const h = react.createElement;
			const { current } = providerKeyGroups(row, namespace, schema, t);
			const profile = schema.getPath(namespace.value, row.entry.settingsPath) ?? {};
			const identity = JSON.stringify([row.entry.provider, current.id, current.credentialRef, profile.baseURL, profile.apiKeyEnv]);
			const profileVersion = JSON.stringify(profile);
			const [reading, setReading] = react.useState(() => ({ identity, value: providerBalanceReadings.get(identity) }));
			const result = reading.identity === identity ? reading.value : providerBalanceReadings.get(identity);
			const updateResult = next => {
				const value = mergeProviderBalanceReading(providerBalanceReadings.get(identity), next);
				providerBalanceReadings.set(identity, value);
				if (providerBalanceReadings.size > 100) providerBalanceReadings.delete(providerBalanceReadings.keys().next().value);
				setReading({ identity, value });
			};
			const [busy, setBusy] = react.useState(true);
			const [clock, setClock] = react.useState(Date.now());
			const requestRef = react.useRef();
			const provider = row.entry.provider;
			const key = current.id;
			const query = react.useCallback(async (force = false) => {
				requestRef.current?.abort();
				const request = new AbortController();
				requestRef.current = request;
				const started = Date.now();
				setBusy(true);
				try {
					const params = new URLSearchParams({ provider, key, refresh: force ? "1" : "0" });
					const response = await fetch(`/api/provider-balance?${params}`, { credentials: "same-origin", signal: AbortSignal.any([request.signal, AbortSignal.timeout(16000)]), cache: "no-store" });
					const next = response.ok ? await response.json() : { status: "error", reason: response.status === 404 ? "restart" : "query" };
					if (!request.signal.aborted) {
						if (next.status === "ok" && next.balances) recordLocalSpend(provider, key, next.balances, next.updatedAt, next.history);
						updateResult(next);
						setClock(Date.now());
					}
				} catch {
					if (!request.signal.aborted) updateResult({ status: "error", reason: "query" });
				} finally {
					if (!request.signal.aborted) {
						/* Cached replies finish in tens of ms; hold busy so the
						   refresh glyph actually completes a visible spin. */
						const hold = Math.max(0, 700 - (Date.now() - started));
						if (hold) await new Promise(resolve => setTimeout(resolve, hold));
						if (!request.signal.aborted) setBusy(false);
					}
				}
			}, [provider, key, identity, profileVersion]);
			react.useEffect(() => {
				query();
				const refresh = () => { query(true); };
				window.addEventListener("harness-balance-settings-updated", refresh);
				window.addEventListener("harness-balance-refresh-all", refresh);
				return () => { requestRef.current?.abort(); window.removeEventListener("harness-balance-settings-updated", refresh); window.removeEventListener("harness-balance-refresh-all", refresh); };
			}, [query]);
			react.useEffect(() => {
				if (!result || result.status === "unavailable") return;
				const timer = setInterval(() => { if (!document.hidden) query(); }, Math.max(60, result.interval || 300) * 1000);
				return () => clearInterval(timer);
			}, [query, result?.interval, result?.status]);
			react.useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 30000); return () => clearInterval(timer); }, []);
			const minutes = Math.max(0, Math.floor((clock - (result?.updatedAt || clock)) / 60000));
			/* Mirror the reference card: minutes stay the common case, then hours
			   and days keep a long-lived reading from printing "3120 分钟前". */
			const age = minutes < 1 ? t("balanceJustNow")
				: minutes < 60 ? t("balanceMinutesAgo").replace("{n}", String(minutes))
					: minutes < 1440 ? t("balanceHoursAgo").replace("{n}", String(Math.floor(minutes / 60)))
						: t("balanceDaysAgo").replace("{n}", String(Math.floor(minutes / 1440)));
			const failure = result?.reason === "setup" ? "当前密钥没有匹配的余额查询配置。请点击右侧编辑，在余额页配置查询，或检查自动查询来源。" : result?.reason === "restart" ? t("balanceRestart") : result?.reason === "auth" ? t("balanceAuth") : t("balanceErrorHint");
			// Only an explicitly disabled query is hidden. Missing setup must not
			// look like a disappearing balance or silently discard a prior reading.
			if (result?.status === "unavailable" && result.reason === "disabled") return null;
			const remainingTone = remaining => {
				const n = Number(remaining);
				if (!Number.isFinite(n) || n <= 0) return "zGbnIq_balanceLow";
				if (n < 1) return "zGbnIq_balanceRemaining";
				return "zGbnIq_balanceOk";
			};
			const number = value => value == null ? "—" : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			return h("div", { className: "zGbnIq_balance", "data-stale": result?.stale || false, "aria-busy": busy },
				h("span", { className: "zGbnIq_balanceMeta" },
					h("span", { className: "zGbnIq_balanceAge", title: result?.historyError ? "余额查询成功，但消费记录写入本机文件失败。原文件已保留。" : result?.status === "error" ? failure : result?.updatedAt ? new Date(result.updatedAt).toLocaleString() : undefined },
						result?.updatedAt ? h("svg", { width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
							h("circle", { cx: 12, cy: 12, r: 9 }), h("path", { d: "M12 7.5V12l3 2" })) : null,
						h("span", null, result?.historyError ? "消费记录保存失败" : result?.status === "error" && result.balances ? t("balanceStale") : result?.updatedAt ? age : "")),
					h("button", { type: "button", className: "zGbnIq_balanceRefresh", "data-busy": busy, disabled: busy, onClick: () => query(true), title: busy ? t("balanceLoading") : t("balanceRefresh"), "aria-label": `${t("balanceRefresh")} · ${row.entry.displayName}` },
					h("svg", { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
						h("path", { d: "M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17" })))),
				result?.balances ? h("span", { className: "zGbnIq_balanceNumbers", "aria-live": "polite", title: result.scope === "account" ? t("balanceAccountHint") : t("balanceKeyHint") },
					...result.balances.map((entry, i) => h("span", { key: i, className: "zGbnIq_balanceNumbers" },
						h("span", { title: entry.used == null ? t("balanceUsedUnknown") : undefined }, t("balanceUsed"), h("strong", null, number(entry.used))),
						h("span", null, t("balanceRemaining"), h("strong", { className: remainingTone(entry.remaining) }, number(entry.remaining)), h("span", { className: "zGbnIq_balanceUnit" }, "元")))))
					: h("span", { className: "zGbnIq_balanceNumbers", title: failure }, busy ? t("balanceLoading") : result?.reason === "setup" ? "当前密钥未配置余额查询" : t("balanceFailed")));
		}
		function Loaded({ injected, renderSlot }) {
			const { controller, operations, schema, t } = injected;
			const snapshot = injected.useSnapshot((value) => value);
			const state = {
				...snapshot,
				rows: snapshot.rows.map((row) => row.entry.provider === "deepseek-account" ? {
					...row,
					entry: {
						...row.entry,
						displayName: t("deepSeekAccount")
					}
				} : row)
			};
			const [editing, setEditing] = (0, react.useState)(void 0);
			const [addOpen, setAddOpen] = (0, react.useState)(false);
			const [addMode, setAddMode] = (0, react.useState)("catalog");
			/** The modes shown since the add card opened; each keeps its panel mounted. */
			const [visited, setVisited] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			/** Whether each add panel has a write or an interrogation in flight. */
			const [catalogBusy, setCatalogBusy] = (0, react.useState)(false);
			const [customBusy, setCustomBusy] = (0, react.useState)(false);
			/** Base of the add card's tab and panel ids. */
			const addId = (0, react.useId)();
			const [deleteTarget, setDeleteTarget] = (0, react.useState)(void 0);
			const [deleting, setDeleting] = (0, react.useState)(false);
			const [deleteFailure, setDeleteFailure] = (0, react.useState)(void 0);
			const [savedTarget, setSavedTarget] = (0, react.useState)(void 0);
			const [dismissedSetup, setDismissedSetup] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [refreshingAll, setRefreshingAll] = (0, react.useState)(false);
			const refreshAll = () => {
				if (refreshingAll) return;
				setRefreshingAll(true);
				window.dispatchEvent(new Event("harness-balance-refresh-all"));
				window.setTimeout(() => setRefreshingAll(false), 1200);
			};
			const announceSaved = (target) => {
				controller.load().then(() => {
					setSavedTarget(target);
				});
			};
			/**
			* Close the add card whole. The catalog target is forgotten with it, since
			* `editing` doubles as the row editor's target once the card is closed and a
			* refresh could otherwise open the row of a provider the draft never saved.
			* The busy flags reset here because a panel that closes itself on success
			* unmounts before it can report idle.
			*/
			const closeAdd = () => {
				setEditing(void 0);
				setAddOpen(false);
				setCatalogBusy(false);
				setCustomBusy(false);
			};
			const closeEditor = (changed, target) => {
				closeAdd();
				if (changed) announceSaved(target);
			};
			/**
			* Close a setup card, which owns none of the state above: the row-editor
			* and add cards each own one of those, so clearing them here would discard
			* a draft the user opened beside this card. Dismissal is this card's own —
			* the provider falls back to an ordinary row for the rest of the session,
			* and reopens through Edit.
			*/
			const closeSetup = (changed, target) => {
				setDismissedSetup((previous) => new Set([...previous, target.provider]));
				if (changed) announceSaved(target);
			};
			const closeDelete = () => {
				if (deleting) return;
				setDeleteTarget(void 0);
				setDeleteFailure(void 0);
			};
			const confirmDelete = () => {
				/* v8 ignore next -- the action only renders with a target and is disabled while a deletion is pending */
				if (deleteTarget === void 0 || deleting) return;
				setDeleting(true);
				setDeleteFailure(void 0);
				removeProviderProfile(operations, controller, deleteTarget).then((failure) => {
					if (failure !== void 0) {
						setDeleteFailure(failure);
						return;
					}
					setDeleteTarget(void 0);
				}).finally(() => {
					setDeleting(false);
				});
			};
			if (state.status === "idle") controller.load();
			if (state.status === "error") {
				/* v8 ignore next -- an error status always carries text; the fallback satisfies the nullable type */
				const errorText = state.error ?? "";
				return (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["section"],
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: `${t("loadFailed")}: ${errorText}`
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ModelsSection_module_css_default["secondaryButton"],
						onClick: () => {
							controller.load();
						},
						children: t("retry")
					})]
				});
			}
			const savedRow = savedTarget === void 0 ? void 0 : state.rows.find((row) => row.entry.provider === savedTarget.provider);
			const savedIdentity = savedRow === void 0 ? savedTarget : {
				provider: savedRow.entry.provider,
				displayName: savedRow.entry.displayName
			};
			const anyUsable = state.rows.some(providerUsable);
			const configured = state.rows.filter((row) => row.configured);
			const configurable = state.rows.filter((row) => state.namespaces.has(row.entry.settingsNs));
			const addable = state.rows.flatMap((row) => {
				const namespace = state.namespaces.get(row.entry.settingsNs);
				return namespace === void 0 || row.configured ? [] : [{
					row,
					namespace
				}];
			});
			const piAi = state.namespaces.get("llm-pi-ai");
			const protocols = protocolChoices(piAi, schema);
			const catalogOffered = configurable.length > 0;
			const catalogEnabled = addable.length > 0;
			const customOffered = piAi !== void 0;
			const customEnabled = protocols.length > 0;
			const bothOffered = catalogOffered && customOffered;
			const mode = bothOffered ? addMode : customOffered ? "custom" : "catalog";
			const mounted = (candidate) => mode === candidate || visited.has(candidate);
			const switchLocked = catalogBusy || customBusy;
			const draft = (() => {
				if (!addOpen || !catalogOffered) return void 0;
				const kept = editing === void 0 ? void 0 : state.namespaces.get(editing.settingsNs);
				if (editing !== void 0 && kept !== void 0) return {
					target: editing,
					namespace: kept
				};
				const first = addable[0];
				return first === void 0 ? void 0 : {
					target: targetOf(first.row),
					namespace: first.namespace
				};
			})();
			const addRow = draft === void 0 ? void 0 : state.rows.find((row) => row.entry.provider === draft.target.provider);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["section"],
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "zGbnIq_heading",
						children: [
							(0, react_jsx_runtime.jsxs)("div", { children: [
								(0, react_jsx_runtime.jsx)("h2", {
									className: ModelsSection_module_css_default["title"],
									children: t("title")
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: ModelsSection_module_css_default["intro"],
									children: t("intro")
								})
							] }),
							configured.length ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "zGbnIq_refreshAll",
						"data-busy": refreshingAll,
						disabled: refreshingAll,
						onClick: refreshAll,
						title: "同时刷新全部供应商当前密钥的余额",
						"aria-label": "刷新全部余额",
						children: [
							(0, react_jsx_runtime.jsx)("svg", { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: (0, react_jsx_runtime.jsx)("path", { d: "M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17" }) }),
							refreshingAll ? "刷新中…" : "刷新全部余额"
						]
					}) : null
						]
					}),
					!state.writable && state.status === "ready" ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["notice"],
						children: t("readOnly")
					}) : null,
					savedIdentity === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["savedNotice"],
						role: "status",
						"aria-live": "polite",
						children: providerCopy(t("savedProvider"), savedIdentity)
					}),
					(0, react_jsx_runtime.jsx)("ul", {
						className: ModelsSection_module_css_default["rows"],
						children: configured.map((row) => {
							const target = targetOf(row);
							const namespace = state.namespaces.get(target.settingsNs);
							/* v8 ignore next -- the join marks a row configured only when its namespace resolved */
							if (namespace === void 0) return null;
							const error = row.entry.error === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								className: ModelsSection_module_css_default["error"],
								children: row.entry.error
							});
							if (needsSetup(row, anyUsable) && !dismissedSetup.has(row.entry.provider)) return (0, react_jsx_runtime.jsxs)("li", {
								className: ModelsSection_module_css_default["setupCard"],
								children: [
									error,
									renderProviderEditor({
										target,
										namespace,
										schema,
										operations,
										t,
										readOnly: !state.writable,
										onClose: (changed) => {
											closeSetup(changed, target);
										}
									}),
									renderSlot("settings.models.provider-card", {
										provider: row.entry,
										configured: row.configured,
										keyConfigured: keyConfiguredOf(row)
									}, { entryKey: row.entry.settingsNs })
								]
							}, row.entry.provider);
							const open = !addOpen && editing?.provider === row.entry.provider;
							const credentialConfigured = row.credential?.configured === true;
							const credentialMissing = !credentialConfigured && row.apiKeyEnv !== void 0 && row.credential?.configured === false;
							return (0, react_jsx_runtime.jsxs)("li", {
								className: ModelsSection_module_css_default["rowCard"],
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: ModelsSection_module_css_default["rowHead"],
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: "zGbnIq_providerAvatar",
											"aria-hidden": true,
											children: Array.from(row.entry.displayName || row.entry.provider)[0]?.toLocaleUpperCase()
										}), (0, react_jsx_runtime.jsxs)("div", {
											className: "zGbnIq_rowMain",
											children: [(0, react_jsx_runtime.jsxs)("span", {
											className: ModelsSection_module_css_default["rowIdentity"],
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: ModelsSection_module_css_default["rowName"],
													title: row.entry.displayName,
													children: row.entry.displayName
												}),
												schema.getPath(namespace.value, [...target.settingsPath, "enabled"]) === false ? react.createElement("span", { className: ModelsSection_module_css_default.rowTag }, t("providerDisabled")) : null,
								row.entry.declared === true ? (0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["rowTag"],
									children: t("customTag")
								}) : null
											]
										}), react.createElement(ProviderKeyGroup, { row, namespace, schema, operations, controller, disabled: !state.writable || editing !== void 0 || addOpen, t })]
										}), react.createElement(ProviderBalance, { row, namespace, schema, t }), (0, react_jsx_runtime.jsxs)("span", {
											className: ModelsSection_module_css_default["rowActions"],
											children: [(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: ModelsSection_module_css_default["secondaryButton"],
												"aria-label": providerCopy(t("editProvider"), target),
												onClick: () => {
													setSavedTarget(void 0);
													setAddOpen(false);
													setEditing(open ? void 0 : target);
												},
												children: t("edit")
											}), row.removable ? (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: ModelsSection_module_css_default["dangerButton"],
												"aria-label": providerCopy(t("removeProvider"), target),
												title: providerCopy(t("removeProvider"), target),
												disabled: !state.writable,
												onClick: () => {
													setSavedTarget(void 0);
													setDeleteFailure(void 0);
													setDeleteTarget(target);
												},
												children: (0, react_jsx_runtime.jsx)("svg", {
													width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
													children: (0, react_jsx_runtime.jsx)("path", { d: "M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" })
												})
											}) : null]
										})]
									}),
									error,
									renderSlot("settings.models.provider-card", {
										provider: row.entry,
										configured: row.configured,
										keyConfigured: keyConfiguredOf(row)
									}, { entryKey: row.entry.settingsNs }),
									open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
										open: true,
										title: target.displayName,
										closeLabel: t("close"),
										onClose: () => closeEditor(false, target),
										className: ModelsSection_module_css_default["editorModal"],
										children: renderProviderEditor({
										hideTitle: true,
										target,
										namespace,
										schema,
										operations,
										t,
										readOnly: !state.writable,
										onClose: (changed) => {
											closeEditor(changed, target);
										}
									})
								}) : null
								]
							}, row.entry.provider);
						})
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ModelsSection_module_css_default["addBlock"],
						children: addOpen ? (0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["addCard"],
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: ModelsSection_module_css_default["addModes"],
									children: [bothOffered ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedControl, {
										id: addId,
										label: t("addMode"),
										value: mode,
										disabled: switchLocked,
										options: [{
											value: "catalog",
											label: t("addCatalog"),
											disabled: !catalogEnabled,
											...catalogEnabled ? {} : { title: t("addCatalogExhausted") }
										}, {
											value: "custom",
											label: t("addCustom"),
											disabled: !customEnabled,
											...customEnabled ? {} : { title: t("addCustomUnavailable") }
										}],
										onChange: (next) => {
											setAddMode(next);
											setVisited((previous) => new Set([...previous, next]));
										}
									}) : (0, react_jsx_runtime.jsx)("div", {
										className: ModelsSection_module_css_default["editorHeader"],
										children: (0, react_jsx_runtime.jsx)("span", {
											className: ModelsSection_module_css_default["editorTitle"],
											children: t(mode === "catalog" ? "addCatalog" : "addCustom")
										})
									}), (0, react_jsx_runtime.jsx)("p", {
										className: ModelsSection_module_css_default["advancedHint"],
										children: t(mode === "catalog" ? "addCatalogHint" : "addCustomHint")
									})]
								}),
								mounted("catalog") && draft !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
									id: `${addId}-catalog-panel`,
									...bothOffered ? {
										role: "tabpanel",
										"aria-labelledby": `${addId}-catalog`
									} : {},
									hidden: mode !== "catalog",
									className: ModelsSection_module_css_default["addPanel"],
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: ModelsSection_module_css_default["field"],
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: ModelsSection_module_css_default["fieldLabel"],
												children: t("provider")
											}), (0, react_jsx_runtime.jsx)("select", {
												className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
												value: draft.target.provider,
												"aria-label": t("provider"),
												disabled: catalogBusy,
												onChange: (event) => {
													const picked = addable.find((candidate) => candidate.row.entry.provider === event.target.value);
													/* v8 ignore next -- the select only lists addable rows */
													if (picked === void 0) return;
													setEditing(targetOf(picked.row));
												},
												children: addable.map(({ row }) => (0, react_jsx_runtime.jsx)("option", {
													value: row.entry.provider,
													children: row.entry.displayName
												}, row.entry.provider))
											})]
										}),
										(0, react_jsx_runtime.jsx)(ProviderEditor, {
											provider: draft.target.provider,
											displayName: draft.target.displayName,
											hideTitle: true,
											namespace: draft.namespace,
											schema,
											settingsPath: draft.target.settingsPath,
											operations,
											t,
											readOnly: !state.writable,
											onClose: (changed) => {
												closeEditor(changed, draft.target);
											},
											onBusyChange: setCatalogBusy
										}, draft.target.provider),
										addRow === void 0 ? null : renderSlot("settings.models.provider-card", {
											provider: addRow.entry,
											configured: addRow.configured,
											keyConfigured: keyConfiguredOf(addRow)
										}, { entryKey: addRow.entry.settingsNs })
									]
								}) : null,
								mounted("custom") && piAi !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
									id: `${addId}-custom-panel`,
									...bothOffered ? {
										role: "tabpanel",
										"aria-labelledby": `${addId}-custom`
									} : {},
									hidden: mode !== "custom",
									className: ModelsSection_module_css_default["addPanel"],
									children: (0, react_jsx_runtime.jsx)(CustomProviderCard, {
										taken: state.rows.map((row) => row.entry.provider),
										protocols,
										revision: piAi.revision,
										operations,
										t,
										readOnly: !state.writable,
										onClose: (changed) => {
											closeAdd();
											if (changed) controller.load();
										},
										onBusyChange: setCustomBusy
									})
								}) : null
							]
						}) : catalogOffered || customOffered ? (0, react_jsx_runtime.jsx)("div", {
							className: ModelsSection_module_css_default["addActions"],
							children: (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ModelsSection_module_css_default["addButton"],
								disabled: !state.writable || !catalogEnabled && !customEnabled,
								onClick: () => {
									const first = addable[0];
									const initial = catalogEnabled ? "catalog" : "custom";
									setSavedTarget(void 0);
									setEditing(first === void 0 ? void 0 : targetOf(first.row));
									setAddMode(initial);
									setVisited(new Set([initial]));
									setAddOpen(true);
								},
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("add")]
							})
						}) : null
					}),
					renderSlot("settings.models.footer", {}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: deleteTarget !== void 0,
						onClose: closeDelete,
						title: deleteTarget === void 0 ? "" : providerCopy(t("deleteTitle"), deleteTarget),
						closeLabel: t("close"),
						description: deleteTarget === void 0 ? "" : providerCopy(deleteTarget.credentialRef === void 0 ? t("deleteDescription") : t("deleteDescriptionWithCredential"), deleteTarget),
						className: ModelsSection_module_css_default["deleteDialog"],
						footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							"data-modal-autofocus": true,
							disabled: deleting,
							onClick: closeDelete,
							children: t("cancel")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							className: ModelsSection_module_css_default["deleteConfirm"],
							disabled: deleting,
							onClick: confirmDelete,
							children: deleteTarget === void 0 ? "" : providerCopy(deleting ? t("deleting") : t("deleteConfirm"), deleteTarget)
						})] }),
						children: deleteFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
							className: ModelsSection_module_css_default["error"],
							children: deleteFailure
						})
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-settings-models/src/client/OnboardingModal.module.css.mjs
		const css$2 = ".jLrgrW_dialog{width:min(600px,100%);max-height:100%;padding:0}.jLrgrW_content{box-sizing:border-box;flex-direction:column;min-height:0;padding:28px;display:flex;overflow-y:auto}.jLrgrW_title{color:var(--dsw-alias-label-primary);outline:none;margin:0;font-size:20px;font-weight:500;line-height:28px}.jLrgrW_body{margin-top:20px}@media (width<=560px){.jLrgrW_content{padding:24px}}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-settings-models/OnboardingModal.module.css";
		if (typeof document !== "undefined") {
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-models";
				tag.dataset.pluginCss = tagId$2;
				document.head.appendChild(tag);
			}
			if (tag.textContent !== css$2) tag.textContent = css$2;
		}
		var OnboardingModal_module_css_default = {
			"body": "jLrgrW_body",
			"content": "jLrgrW_content",
			"dialog": "jLrgrW_dialog",
			"title": "jLrgrW_title"
		};
		//#endregion
		//#region lib/types/client/OnboardingModal.js
		/** Shared modal chrome for every step registered by this onboarding plugin. */
		const ignoreImplicitDismiss = () => {};
		/**
		* Render a blocking onboarding dialog and keep the application root inert.
		* @param props.title - accessible and visible dialog title.
		* @param props.focusTitle - focus the title when the step has no form control.
		* @param props.children - step-owned body and actions.
		* @returns the body-portaled modal.
		*/
		function OnboardingModal({ title, focusTitle = false, children }) {
			const titleRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const appRoot = document.getElementById("root");
				if (appRoot === null) return;
				const previous = appRoot.inert;
				appRoot.inert = true;
				return () => {
					appRoot.inert = previous;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (focusTitle) titleRef.current?.focus();
			}, [focusTitle]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				title,
				onClose: ignoreImplicitDismiss,
				headless: true,
				className: OnboardingModal_module_css_default.dialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: OnboardingModal_module_css_default.content,
					children: [(0, react_jsx_runtime.jsx)("h2", {
						ref: titleRef,
						className: OnboardingModal_module_css_default.title,
						tabIndex: focusTitle ? -1 : void 0,
						children: title
					}), (0, react_jsx_runtime.jsx)("div", {
						className: OnboardingModal_module_css_default.body,
						children
					})]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-settings-models/src/client/DeepSeekOnboardingDialog.module.css.mjs
		const css$1 = ".GL8Viq_description{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:24px}.GL8Viq_editor{margin-top:24px}@media (width<=560px){.GL8Viq_editor{margin-top:20px}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-settings-models/DeepSeekOnboardingDialog.module.css";
		if (typeof document !== "undefined") {
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-models";
				tag.dataset.pluginCss = tagId$1;
				document.head.appendChild(tag);
			}
			if (tag.textContent !== css$1) tag.textContent = css$1;
		}
		var DeepSeekOnboardingDialog_module_css_default = {
			"description": "GL8Viq_description",
			"editor": "GL8Viq_editor"
		};
		//#endregion
		//#region lib/types/client/DeepSeekOnboardingDialog.js
		/* v8 ignore next 3 -- closed-union defaults only defend future source widening */
		function assertNever$1(_value) {
			throw new Error("unexpected DeepSeek onboarding state");
		}
		/**
		* Prompt a first-run user for the official DeepSeek credential while no
		* provider can serve requests and that credential is writable.
		* @param props - settings-shell owner state and Models feature dependencies.
		* @returns the onboarding modal or null when onboarding needs no intervention.
		*/
		function DeepSeekOnboardingDialog(props) {
			const { complete, controller, useModels, operations, schema, t, renderSlot, automatic, explicit = false } = props;
			const [apiKey, setApiKey] = (0, react.useState)(explicit);
			const state = useModels((snapshot) => snapshot);
			const readiness = onboardingReadiness(state);
			(0, react.useEffect)(() => {
				if ((automatic || explicit) && state.status === "idle") controller.load();
			}, [
				controller,
				state.status,
				automatic,
				explicit
			]);
			(0, react.useEffect)(() => {
				if (!automatic && !explicit || readiness.kind === "adapter-absent" || !explicit && readiness.kind === "provider-ready" || readiness.kind === "unavailable") complete();
			}, [
				complete,
				readiness.kind,
				explicit,
				automatic
			]);
			if (!automatic && !explicit) return null;
			switch (readiness.kind) {
				case "loading":
				case "adapter-absent":
				case "unavailable": return null;
				case "provider-ready":
					if (!explicit) return null;
					break;
				case "credential-missing": break;
				/* v8 ignore next -- every current readiness variant is handled above */
				default: return assertNever$1(readiness);
			}
			const row = state.rows.find((candidate) => candidate.entry.provider === "deepseek-official" && candidate.entry.settingsNs === "llm-deepseek" && candidate.entry.settingsPath.length === 0);
			const namespace = state.namespaces.get("llm-deepseek");
			/* v8 ignore next 2 -- credential-missing is derived only from this exact joined row. */
			if (row === void 0 || namespace === void 0) return null;
			const finishCredential = (changed) => {
				if (!changed) {
					complete();
					return;
				}
				controller.load();
			};
			const editor = (0, react_jsx_runtime.jsxs)(OnboardingModal, {
				title: t("onboardingTitle"),
				children: [(0, react_jsx_runtime.jsx)("p", {
					className: DeepSeekOnboardingDialog_module_css_default.description,
					children: t("onboardingDescription")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: DeepSeekOnboardingDialog_module_css_default.editor,
					children: (0, react_jsx_runtime.jsx)(ProviderEditor, {
						provider: row.entry.provider,
						displayName: row.entry.displayName,
						namespace,
						schema,
						settingsPath: row.entry.settingsPath,
						operations,
						t,
						readOnly: false,
						hideTitle: true,
						credentialOnly: true,
						onSubmitCredential: () => {
							props.track?.("api_key_save_click", {});
						},
						credentialRequired: true,
						autoFocusCredential: true,
						cancelLabelKey: "onboardingLater",
						submitLabelKey: "onboardingSave",
						submitBusyLabelKey: "onboardingSaving",
						onClose: finishCredential
					})
				})]
			});
			return apiKey ? editor : renderSlot("settings.models.sign-in", {
				complete,
				useApiKey: () => {
					setApiKey(true);
				}
			}, { fallback: editor });
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-settings-models/src/client/WelcomeNotice.module.css.mjs
		const css = ".t1T8VW_copy{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:24px}.t1T8VW_copy p{margin:0}.t1T8VW_copy p+p{margin-top:12px}.t1T8VW_error{color:var(--dsw-alias-state-error-primary);margin:16px 0 0;font-size:14px;line-height:22px}.t1T8VW_actions{justify-content:flex-end;margin-top:24px;display:flex}.t1T8VW_primary{min-width:120px}@media (width<=560px){.t1T8VW_primary{width:100%}}";
		const tagId = "@deepseek-ai/dsh-client-ui-settings-models/WelcomeNotice.module.css";
		if (typeof document !== "undefined") {
			let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]");
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-settings-models";
				tag.dataset.pluginCss = tagId;
				document.head.appendChild(tag);
			}
			if (tag.textContent !== css) tag.textContent = css;
		}
		var WelcomeNotice_module_css_default = {
			"actions": "t1T8VW_actions",
			"copy": "t1T8VW_copy",
			"error": "t1T8VW_error",
			"primary": "t1T8VW_primary"
		};
		//#endregion
		//#region lib/types/client/WelcomeNotice.js
		/** Product-wide, versioned preview notice. */
		/**
		* Render the current notice until its exact copy version is acknowledged.
		* @param props - settings-shell owner state and welcome dependencies.
		* @returns the welcome modal or null while the step decides not to show.
		*/
		function WelcomeNotice(props) {
			const { complete, controller, useWelcome, t } = props;
			const state = useWelcome((snapshot) => snapshot);
			const finished = (0, react.useRef)(false);
			const finish = (0, react.useCallback)(() => {
				if (finished.current) return;
				finished.current = true;
				complete();
			}, [complete]);
			(0, react.useEffect)(() => {
				if (state.status === "idle") controller.load();
			}, [controller, state.status]);
			(0, react.useEffect)(() => {
				if (state.acknowledged) finish();
			}, [finish, state.acknowledged]);
			if (state.status === "idle" || state.status === "loading" || state.acknowledged) return null;
			const acknowledge = async () => {
				if (await controller.acknowledge()) finish();
			};
			const paragraphs = t("welcomeBody").split("\n\n");
			return (0, react_jsx_runtime.jsxs)(OnboardingModal, {
				title: t("welcomeTitle"),
				focusTitle: true,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: WelcomeNotice_module_css_default.copy,
						children: paragraphs.map((paragraph) => (0, react_jsx_runtime.jsx)("p", { children: paragraph }, paragraph))
					}),
					state.error === null ? null : (0, react_jsx_runtime.jsx)("p", {
						className: WelcomeNotice_module_css_default.error,
						role: "alert",
						children: t("welcomeError")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: WelcomeNotice_module_css_default.actions,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							className: WelcomeNotice_module_css_default.primary,
							disabled: state.status === "saving",
							onClick: () => {
								acknowledge();
							},
							children: t("welcomeContinue")
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/onboarding-copy.js
		/** Durable settings namespace for product-wide GUI onboarding facts. */
		const WELCOME_NOTICE_SETTINGS_NAMESPACE = "ui-settings-general";
		/** Field storing the last welcome notice version the user acknowledged. */
		const WELCOME_NOTICE_ACK_FIELD = "welcomeNoticeVersion";
		/**
		* Bump only when the notice changes materially and every user should see it
		* again. The acknowledgement is compared for exact equality.
		*/
		const WELCOME_NOTICE_VERSION = "2026-09-28.1";
		//#endregion
		//#region lib/types/client/welcome-store.js
		/**
		* Welcome-notice state derived from the welcome settings scope. The scope is
		* the transport: a loopback browser follows the durable Host section, while a
		* remote browser's memory-mode scope never answers and the acknowledgement
		* stays process-local here.
		*/
		/* v8 ignore next 3 -- closed-union default only defends future source widening */
		function assertNever(_value) {
			throw new Error("unexpected welcome settings status");
		}
		/** Coordinates durable Host acknowledgement or a process-local remote fallback. */
		var WelcomeNoticeStore = class {
			scope;
			/** uSES-safe state source shared by the registered welcome step. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "idle",
				acknowledged: false,
				error: null
			});
			localAcknowledged = false;
			saving = false;
			following;
			/**
			* @param scope - the welcome settings namespace scope; its memory mode is
			* what keeps a remote browser process-local.
			*/
			constructor(scope) {
				this.scope = scope;
			}
			/**
			* Begin following the bound scope (idempotent) and publish its current answer.
			* @returns settlement after the current answer is published.
			*/
			load() {
				this.following ??= this.scope.subscribe(() => {
					this.derive();
				});
				this.derive();
				return Promise.resolve();
			}
			/**
			* Persist this copy version, or advance only this process for a remote
			* browser. Success is judged against the state the write left behind, so a
			* refused or failed write reports false after its recovery read settles.
			* @returns true when the selected persistence mode holds the acknowledgement.
			*/
			async acknowledge() {
				if (this.scope.getSnapshot().mode === "memory") {
					this.localAcknowledged = true;
					this.derive();
					return true;
				}
				this.saving = true;
				this.store.update((state) => {
					state.status = "saving";
					state.error = null;
				});
				try {
					await this.scope.set(WELCOME_NOTICE_ACK_FIELD, WELCOME_NOTICE_VERSION);
				} finally {
					this.saving = false;
				}
				this.derive();
				const { acknowledged } = this.store.getSnapshot();
				if (!acknowledged) this.store.update((state) => {
					state.status = "error";
					state.error = "the acknowledgement did not persist";
				});
				return acknowledged;
			}
			/** Stop following the scope. */
			dispose() {
				this.following?.();
				this.following = void 0;
			}
			derive() {
				if (this.saving) return;
				const scope = this.scope.getSnapshot();
				if (scope.mode === "memory") {
					this.store.update((state) => {
						state.status = "ready";
						state.acknowledged = this.localAcknowledged;
						state.error = null;
					});
					return;
				}
				switch (scope.status) {
					case "loading":
						this.store.update((state) => {
							state.status = "loading";
							state.error = null;
						});
						return;
					case "unavailable":
						this.store.update((state) => {
							state.status = "error";
							state.acknowledged = false;
							state.error = "welcome acknowledgement settings are unavailable";
						});
						return;
					case "ready": {
						const acknowledged = scope.value?.[WELCOME_NOTICE_ACK_FIELD] === WELCOME_NOTICE_VERSION;
						this.store.update((state) => {
							state.status = "ready";
							state.acknowledged = acknowledged;
							state.error = null;
						});
						return;
					}
					/* v8 ignore next -- every current settings scope status is handled above */
					default: return assertNever(scope.status);
				}
			}
		};
		//#endregion
		//#region lib/types/client/operations.js
		/**
		* The Host reads and writes the Models cards perform, as callbacks built in the
		* plugin body. Cards receive these instead of a context: the outcomes name what
		* a card renders — a stored view, a stale revision, a refusal message — so the
		* failure codes and Remote namespaces stay in the apply world.
		*/
		/**
		* Bind the page's Host operations to the plugin's own Remote namespaces.
		* @param ctx - the page plugin's context, which declares `remote.credentials`,
		* `remote.llm`, and `remote.settings` in its own `inject`.
		* @returns the callbacks the section and its cards are injected with.
		*/
		function createModelsOperations(ctx) {
			return {
				describeCredential: async (ref) => {
					const response = await ctx.remote.credentials.describe([ref]);
					return response.ok ? response.value[ref] : void 0;
				},
				storeCredential: async (ref, value) => {
					const response = await ctx.remote.credentials.set(ref, value);
					return response.ok ? void 0 : response.error.message;
				},
				removeCredential: async (ref) => {
					const response = await ctx.remote.credentials.unset(ref);
					return response.ok ? void 0 : response.error.message;
				},
				writeSettings: async (ns, ops, expectedRevision) => {
					const response = await ctx.remote.settings.mutate(ns, ops, expectedRevision);
					if (response.ok) return {
						kind: "written",
						view: response.value
					};
					const { code, message } = response.error;
					return code === "settings/conflict" ? {
						kind: "conflict",
						message
					} : {
						kind: "refused",
						message
					};
				},
				discoverModels: async (settingsNs, request) => {
					const response = await ctx.remote.llm.discoverModels(settingsNs, request);
					return response.ok ? {
						kind: "found",
						models: response.value
					} : {
						kind: "refused",
						message: response.error.message
					};
				}
			};
		}
		//#endregion
		//#region lib/types/client/schema-operations.js
		/**
		* Hide the Cordis service identity behind bound schema callbacks.
		* @param service - settings-owned schema service available in the apply context.
		* @returns callbacks that cannot expose the service context to React components.
		*/
		function createSettingsSchemaOperations(service) {
			return {
				rehydrate: (serialized) => service.rehydrate(serialized),
				validate: (schema, draft) => service.validate(schema, draft),
				nodeAtPath: (root, path) => service.nodeAtPath(root, path),
				getPath: (value, path) => service.getPath(value, path),
				hasPath: (value, path) => service.hasPath(value, path),
				setPath: (root, path, value) => service.setPath(root, path, value),
				deletePath: (root, path) => service.deletePath(root, path)
			};
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the Models settings section. */
		/** English strings (the key-set source of truth for this pair). */
		const en = {
			nav: "Models",
			deepSeekAccount: "DeepSeek Account",
			title: "Models",
			intro: "Enter your API keys to use models from the following providers.",
			edit: "Edit",
			editProvider: "Edit {provider}",
			remove: "Delete",
			removeProvider: "Delete {provider}",
			deleteTitle: "Delete {provider}?",
			deleteDescription: "Deleting {provider} removes its configuration. Any credential it uses is managed elsewhere and will be kept.",
			deleteDescriptionWithCredential: "Deleting {provider} removes its configuration and stored API key.",
			deleteConfirm: "Delete {provider}",
			deleting: "Deleting {provider}…",
			add: "Add model provider",
			addMode: "How to add",
			addCatalog: "Third-party model provider",
			addCustom: "Custom model API",
			addCatalogHint: "Pick OpenAI, Anthropic, Kimi, or another provider from the built-in catalog and enter its API key.",
			addCustomHint: "Connect a relay, a self-hosted server, or any other OpenAI- or Anthropic-compatible endpoint by its base URL, protocol, and models.",
			addCatalogExhausted: "Every catalog provider is already configured.",
			addCustomUnavailable: "No API protocol is available to declare.",
			provider: "Provider",
			close: "Close",
			cancel: "Cancel",
			apply: "Apply",
			applying: "Applying…",
			savedProvider: "Saved {provider}.",
			credentialConfigured: "API key configured",
			providerKeyLabel: "Key",
			balanceUsed: "Used:", balanceRemaining: "Remaining:", balanceAccount: "Account", balanceKey: "Key quota",
			balanceAccountHint: "Account balance shared by keys on this account; not the selected key's spending limit.", balanceKeyHint: "Quota reported for the selected API key.",
			balanceUsedUnknown: "The provider does not report used amount.", balanceJustNow: "Just updated", balanceMinutesAgo: "{n} min ago", balanceHoursAgo: "{n} h ago", balanceDaysAgo: "{n} d ago",
			balanceRefresh: "Refresh balance", balanceLoading: "Checking balance…", balanceFailed: "Balance query failed", balanceSetup: "Balance query not configured",
			balanceSetupHint: "Configure a supported balance query in CC Switch for this endpoint and API key, then refresh. DeepSeek official balance is queried directly.",
			balanceErrorHint: "Could not retrieve the balance. Try refreshing later.", balanceAuth: "Balance query credentials expired or lack permission. Update the query credentials in CC Switch.",
			balanceRestart: "Restart the Harness background service to enable balance queries.", balanceStale: "Update failed · previous balance",
			credentialUnknown: "API key status unavailable",
			credentialMissing: "API key missing",
			readOnly: "The settings document is read-only in this deployment.",
			loadFailed: "Loading the provider directory failed",
			conflict: "Someone else changed these settings while this card was open. Close it and reopen to edit the current values.",
			retry: "Retry",
			keyInput: "API key",
			keyPlaceholder: "Enter your API key",
			keyPlaceholderNative: "Enter an API key, or leave blank to use environment authentication",
			keyStored: "Configured — enter a new value to replace",
			keyEnvLocked: "Provided by the launch environment (read-only)",
			customized: "Customized settings",
			baseUrl: "Base URL",
			baseUrlDefault: "Provider default",
			deepSeekBaseUrl: "https://api.deepseek.com/anthropic",
			deepSeekEndpointHint: "Use an API endpoint compatible with Anthropic Messages.",
			models: "Models",
			modelsInherited: "Using the adapter defaults",
			modelsCustomized: "Customized model catalog",
			resetModels: "Restore defaults",
			model: "Model",
			modelId: "Model ID",
			modelName: "Display name",
			modelNamePlaceholder: "Uses the model ID when empty",
			contextWindow: "Context window",
			contextWindowPlaceholder: "Uses the provider default",
			maxTokens: "Max output tokens",
			maxTokensPlaceholder: "Uses the provider default",
			modelAdvanced: "Capacities",
			modelKeyNative: "Provider authentication",
            modelKeyEmpty: "No models for this key yet",
            modelKeyFixed: "Models use fixed keys",
            modelApiKey: "Bound API key",
			modelApiKeyDefault: "Provider default",
            groupDefault: "Default key",
            groupUnconfigured: "Not configured",
            groupCurrent: "Default key group",
            groupSwitch: "Switch",
            groupSwitching: "Switching…",
            groupOnlyOne: "Only one key group. Add more in Edit.",
            groupSwitchHint: "Switch the default key for models without an individual key binding. Individually bound models keep their assigned keys.",
            groupMissingCredential: "This group has no configured key. Add its API key in Edit first.",
            groupSwitchFailed: "Could not switch or refresh. Reopen Settings and try again.",
            groupSelected: "Current",
            groupUse: "Use this group",
            providerEnabled: "Enable provider",
            providerEnabledHint: "Available for chat and tests. Changes take effect after saving.",
            providerDisabledHint: "Unavailable for chat and tests. Models and keys are retained. Save to apply.",
            providerDisabled: "Disabled",
            additionalKeys: "Additional API keys",
            additionalKeysHint: "Add named keys, then manage models in their key groups under Models. Each model uses its bound key. Leave stored key values blank to keep them.",
            keyName: "Key name",
            keyReorder: "Drag to reorder; use Up/Down keys when focused. Save to apply.",
            addKey: "+ Add API key",
            removeKey: "Remove key",
            keyInUse: "In use by a model or as default. Change that selection before removing.",
            defaultKey: "Default for unbound models",
            keyNameInvalid: "Key names must be non-empty and unique.",
            keyUnavailable: "A selected key is missing. Choose another key.",
			modelInputTypes: "Input types",
			modelInputText: "Text",
			modelInputImage: "Image",
			addModel: "Add model",
			removeModel: "Delete model",
			modelsEmpty: "No models will be shown in the selector. Unlisted IDs can still be sent directly.",
			keyBlank: "Enter the API key, or leave the field empty to keep the stored one.",
			keyBlankNew: "Enter the API key, or leave the field empty if this provider authenticates another way.",
			keyIllegalCharacters: "This API key is not in a valid format. Please check it.",
			modelIdRequired: "Model ID is required.",
			modelIdDuplicate: "Model ID must be unique.",
			modelNameInvalid: "Display name cannot be empty.",
			modelContextWindow: "Context window",
			modelMaxTokens: "Max output tokens",
			modelContextInvalid: "Context window must be a positive count, like 131072, 256K, or 1M.",
			modelMaxTokensInvalid: "Max output tokens must be a positive count, like 8192, 64K, or 1M.",
			modelImageInput: "Supports image input",
			advancedHint: "Other fields live in cordis.patch.yml; edit that section directly.",
			modelCapacityInvalid: "A capacity must be a number, optionally suffixed K or M.",
			modelDuplicate: "Each model ID may appear once.",
			addModelDescription: "Fetch a catalog or enter a model manually. New models use the key shown below.",
			addModelMethod: "How to add models",
			addModelManual: "Add manually",
			modelAlreadyAdded: "This model is already added to this key.",
			fetchFixedKeyHint: "Fetch available models using this key, then select models to add.",
			fetchStart: "Fetch models",
			fetchRefresh: "Fetch again",
			fetchReady: "Fetch the catalog to choose models, or switch to manual entry.",
			fetchManualFallback: "Try again or switch to manual entry.",
			fetchModels: "Fetch available models",
			fetching: "Asking the provider…",
			fetchKey: "Key / line",
			fetchNeedsBaseUrl: "Enter the base URL first, then fetch.",
			fetchNeedsKey: "Configure this key first, then fetch available models.",
			fetchEmpty: "The provider listed no models. Add them by hand.",
			fetchTitle: "Choose models to add",
			fetchDescription: "These are the models this provider has available. Choose the ones to add.",
			fetchDescriptionWithKey: "These models use the fixed key “{key}”.",
			fetchSearch: "Search models",
			fetchNoMatches: "No matching models.",
			fetchSelectAll: "Select all",
			fetchDeselectAll: "Deselect all",
			fetchAdopt: "Add selected",
			customTag: "Custom",
			customRoute: "Provider ID",
			customRouteHint: "Lowercase identifier, starting with a letter, that uniquely names this provider in requests and as its credential name.",
			customRouteInvalid: "Start with a lowercase letter; then lowercase letters, digits, and dashes.",
			customRouteTaken: "A provider already uses this ID.",
			customDisplayName: "Display name",
			customApi: "API protocol",
			customApiUnset: "Not selected",
			protocolOpenAiCompletions: "OpenAI Chat Completions",
			protocolOpenAiResponses: "OpenAI Responses",
			protocolAnthropicMessages: "Anthropic Messages",
			customNeedsBaseUrl: "A custom provider needs a base URL.",
			customBaseUrlInvalid: "Enter a valid HTTP or HTTPS URL.",
			customNeedsModels: "A custom provider needs at least one model.",
			customBaseUrlPlaceholder: "https://gateway.example/v1",
			customAnthropicBaseUrlPlaceholder: "https://gateway.example",
			settingsPathUnresolvable: "unresolvable settings path",
			create: "Create provider",
			creating: "Creating…",
			welcomeTitle: "Preview Notice",
			welcomeBody: "DeepSeek Harness 0.2 is still in preview, and many areas need continued improvement and refinement. We welcome feedback and suggestions from all developers and users. The new desktop app now targets a broad range of users, while developer-related advanced features can be enabled in the settings. DeepSeek Harness’s product features and plugin APIs are expected to continue rapid iteration and evolution, and will gradually stabilize over time.\n\nWe look forward to exploring the limits of intelligence together with users and developers around the world, building on open-source, reusable, and composable infrastructure. We welcome everyone to bring their ideas to life with DeepSeek Harness and participate in the community to enrich the plugin ecosystem.",
			welcomeContinue: "Continue",
			welcomeError: "The acknowledgement could not be saved. Please try again.",
			onboardingTitle: "Add an API key to get started",
			onboardingDescription: "Configure the official DeepSeek provider to start building.",
			onboardingLater: "Configure later",
			onboardingSave: "Save and continue",
			onboardingSaving: "Saving…",
			keyRequired: "Enter an API key to continue.",
			editorSections: "Provider sections",
			customSection: "Custom",
			keysSection: "Keys",
			modelsSection: "Models",
			balanceSection: "Balance",
			balanceQuery: "Balance query",
			spendHistory: "Daily spend",
			spendHistoryHint: "Saved locally per provider and key after successful balance checks. Switching keys or query types keeps earlier records. The chart shows the last 7 days.",
			spendToday: "Today",
			spendYesterday: "Yesterday",
			spendChart: "Last 7 days",
			spendHistoryEmpty: "No spend recorded yet. Check the balance once to start the log.",
			done: "Done",
			modelEditHint: "Double-click to edit",
			modelReorder: "Drag to reorder"
		};
		/** Chinese strings (same keys as {@link en}). */
		const zh = {
			nav: "模型",
			deepSeekAccount: "DeepSeek 账号",
			title: "模型",
			intro: "填入各提供方的 API 密钥即可使用其模型。",
			editorSections: "供应商分类",
			customSection: "自定义",
			keysSection: "密钥",
			modelsSection: "模型",
			balanceSection: "余额",
			balanceQuery: "余额查询",
			spendHistory: "每日消费",
			spendHistoryHint: "成功查询后按供应商和密钥保存在本机；切换密钥或查询类型不会清空，图表展示最近 7 天。",
			spendToday: "今天",
			spendYesterday: "昨天",
			spendChart: "近 7 天",
			spendHistoryEmpty: "还没有消费记录。先查询一次余额就会开始记账。",
			done: "完成",
			modelEditHint: "双击编辑",
			modelReorder: "拖动调整顺序",
			edit: "编辑",
			editProvider: "编辑 {provider}",
			remove: "删除",
			removeProvider: "删除 {provider}",
			deleteTitle: "删除 {provider}？",
			deleteDescription: "删除 {provider} 会移除其配置；其使用的凭证（如有）由其他位置管理，将会保留。",
			deleteDescriptionWithCredential: "删除 {provider} 会移除其配置和存储的 API 密钥。",
			deleteConfirm: "删除 {provider}",
			deleting: "正在删除 {provider}…",
			add: "添加模型提供商",
			addMode: "添加方式",
			addCatalog: "第三方模型提供商",
			addCustom: "自定义模型 API",
			addCatalogHint: "从内置目录中选择 OpenAI、Anthropic、Kimi 等提供商，填入其 API 密钥即可使用。",
			addCustomHint: "连接中转站、自部署服务或其他兼容 OpenAI / Anthropic 协议的接口，需填写 API 地址、协议和模型。",
			addCatalogExhausted: "目录中的提供商都已添加。",
			addCustomUnavailable: "没有可用的 API 协议。",
			provider: "提供商",
			close: "关闭",
			cancel: "取消",
			apply: "保存",
			applying: "保存中…",
			savedProvider: "已保存 {provider}。",
			credentialConfigured: "API 密钥已配置",
			providerKeyLabel: "密钥",
			balanceUsed: "已使用：", balanceRemaining: "剩余：", balanceAccount: "账户", balanceKey: "密钥额度",
			balanceAccountHint: "这是账户余额，同账户的多个密钥共用；不代表当前密钥的单独额度。", balanceKeyHint: "这是接口返回的当前密钥额度。",
			balanceUsedUnknown: "该供应商未提供已使用金额。", balanceJustNow: "刚刚更新", balanceMinutesAgo: "{n} 分钟前", balanceHoursAgo: "{n} 小时前", balanceDaysAgo: "{n} 天前",
			balanceRefresh: "刷新余额", balanceLoading: "正在查询余额…", balanceFailed: "余额查询失败", balanceSetup: "尚未配置余额查询",
			balanceSetupHint: "请点击供应商右侧的“编辑”，在编辑窗口底部配置余额查询。支持 DeepSeek、New API、通用余额和自定义 JSON 字段。",
			balanceErrorHint: "暂时无法获取余额，请打开供应商编辑窗口测试查询配置，或稍后刷新重试。", balanceAuth: "余额查询凭证已失效或无权限，请在供应商编辑窗口更新查询凭证。",
			balanceRestart: "需要重启 Harness 后台服务以启用余额查询。", balanceStale: "更新失败 · 上次余额",
			credentialUnknown: "密钥状态未知",
			credentialMissing: "API 密钥缺失",
			readOnly: "当前部署的设置文档为只读。",
			loadFailed: "加载提供商目录失败",
			conflict: "这张卡片打开期间，这些设置已被其他地方改动。请关闭后重新打开，在当前值上编辑。",
			retry: "重试",
			keyInput: "API 密钥",
			keyPlaceholder: "输入 API 密钥",
			keyPlaceholderNative: "输入 API 密钥，或留空使用环境认证",
			keyStored: "已配置——输入新值可替换",
			keyEnvLocked: "由启动环境提供（只读）",
			customized: "自定义设置",
			baseUrl: "API 地址",
			baseUrlDefault: "提供商默认",
			deepSeekBaseUrl: "https://api.deepseek.com/anthropic",
			deepSeekEndpointHint: "请填写兼容 Anthropic Messages 协议的 API 地址。",
			models: "模型目录",
			modelsInherited: "正在使用适配器默认模型",
			modelsCustomized: "已自定义模型目录",
			resetModels: "恢复默认模型",
			model: "模型",
			modelId: "模型 ID",
			modelName: "显示名称",
			modelNamePlaceholder: "留空时使用模型 ID",
			contextWindow: "上下文窗口",
			contextWindowPlaceholder: "使用提供商默认值",
			maxTokens: "最大输出 token 数",
			maxTokensPlaceholder: "使用提供方默认值",
			modelAdvanced: "容量",
			modelKeyNative: "供应商认证",
            modelKeyEmpty: "此密钥下暂无模型",
            modelKeyFixed: "模型固定绑定",
            modelApiKey: "绑定的 API 密钥",
			modelApiKeyDefault: "提供方默认",
            groupDefault: "默认密钥",
            groupUnconfigured: "未配置",
            groupCurrent: "默认密钥分组",
            groupSwitch: "切换",
            groupSwitching: "切换中…",
            groupOnlyOne: "只有一个密钥分组，可在“编辑”中添加更多。",
            groupSwitchHint: "切换未单独绑定模型使用的默认密钥。已单独绑定密钥的模型继续使用原来的绑定。",
            groupMissingCredential: "该分组尚未配置密钥，请先在“编辑”中填写。",
            groupSwitchFailed: "切换或刷新失败，请重新打开设置后重试。",
            groupSelected: "当前使用",
            groupUse: "使用此分组",
            providerEnabled: "启用供应商",
            providerEnabledHint: "可用于聊天和检测，修改后保存生效。",
            providerDisabledHint: "停用聊天和检测，保留模型与密钥，修改后保存生效。",
            providerDisabled: "已停用",
            additionalKeys: "多个 API 密钥",
            additionalKeysHint: "添加并命名密钥，然后在“模型”页按密钥分组管理模型；每个模型固定使用绑定的密钥。已保存的密钥留空即可保留。",
            keyName: "密钥名称",
            keyReorder: "拖动调整顺序，也可聚焦后按上下方向键；保存后生效",
            addKey: "+ 添加密钥",
            removeKey: "移除密钥",
            keyInUse: "正被模型或默认设置使用，请先更改对应选择。",
            defaultKey: "未绑定模型使用的默认密钥",
            keyNameInvalid: "请填写密钥名称，且名称不能重复。",
            keyUnavailable: "绑定的密钥不存在，请重新选择。",
			modelInputTypes: "输入类型",
			modelInputText: "文本",
			modelInputImage: "图片",
			addModel: "添加模型",
			removeModel: "删除模型",
			modelsEmpty: "模型选择器中将不显示任何模型；目录外 ID 仍可直接发送。",
			keyBlank: "请输入 API 密钥；留空则保持已存储的密钥。",
			keyBlankNew: "请输入 API 密钥；若该提供商以其他方式鉴权，可以留空。",
			keyIllegalCharacters: "该 API 密钥格式错误，请检查。",
			modelIdRequired: "模型 ID 不能为空。",
			modelIdDuplicate: "模型 ID 不能重复。",
			modelNameInvalid: "显示名称不能为空。",
			modelContextWindow: "上下文窗口",
			modelMaxTokens: "最大输出",
			modelContextInvalid: "上下文窗口必须是正数，例如 131072、256K 或 1M。",
			modelMaxTokensInvalid: "最大输出 token 数必须是正数，例如 8192、64K 或 1M。",
			modelImageInput: "支持图片输入",
			advancedHint: "其余字段在 cordis.patch.yml 中，请直接编辑对应段。",
			modelCapacityInvalid: "容量需为数字，可加 K 或 M 后缀。",
			modelDuplicate: "每个模型 ID 只能出现一次。",
			addModelDescription: "从可用列表选择，或手动填写。新增模型固定使用下方密钥。",
			addModelMethod: "添加方式",
			addModelManual: "手动添加",
			modelAlreadyAdded: "该密钥下已添加此模型。",
			fetchFixedKeyHint: "使用当前密钥获取模型，勾选后即可添加。",
			fetchStart: "获取模型",
			fetchRefresh: "重新获取",
			fetchReady: "获取后在这里选择模型，也可以切换到手动添加。",
			fetchManualFallback: "可以重新获取，或切换到手动添加。",
			fetchModels: "获取可用模型",
			fetching: "正在询问提供方…",
			fetchKey: "查询线路",
			fetchNeedsBaseUrl: "请先填写 API 地址，再获取。",
			fetchNeedsKey: "请先配置这条密钥，再获取可用模型。",
			fetchEmpty: "该提供方没有列出任何模型，请手动添加。",
			fetchTitle: "选择要添加的模型",
			fetchDescription: "以下是模型提供方的可用模型，勾选要添加的模型。",
			fetchDescriptionWithKey: "以下模型固定使用「{key}」这条线路。",
			fetchSearch: "搜索模型",
			fetchNoMatches: "没有匹配的模型。",
			fetchSelectAll: "全选",
			fetchDeselectAll: "取消全选",
			fetchAdopt: "添加所选",
			customTag: "自定义",
			customRoute: "Provider ID",
			customRouteHint: "以小写字母开头的标识，在请求中唯一标识该提供商，并用于派生凭据名。",
			customRouteInvalid: "需以小写字母开头，之后可用小写字母、数字和短横线。",
			customRouteTaken: "已有提供商使用了这个 ID。",
			customDisplayName: "显示名称",
			customApi: "API 协议",
			customApiUnset: "未选择",
			protocolOpenAiCompletions: "OpenAI Chat Completions",
			protocolOpenAiResponses: "OpenAI Responses",
			protocolAnthropicMessages: "Anthropic Messages",
			customNeedsBaseUrl: "自定义模型 API 需要填写 API 地址。",
			customBaseUrlInvalid: "请输入有效的 HTTP 或 HTTPS 地址。",
			customNeedsModels: "自定义模型 API 至少需要一个模型。",
			customBaseUrlPlaceholder: "https://gateway.example/v1",
			customAnthropicBaseUrlPlaceholder: "https://gateway.example",
			settingsPathUnresolvable: "无法解析设置路径",
			create: "创建提供商",
			creating: "创建中…",
			welcomeTitle: "预览版说明",
			welcomeBody: "DeepSeek Harness 目前的 0.2 版本仍处于预览阶段，还有许多地方需要持续改进和打磨，希望听取广大开发者和用户的反馈建议。现在，新的桌面端面向广泛用户，开发者相关的进阶功能可在配置中开启使用。预计 DeepSeek Harness 的产品功能以及插件 API 都会继续快速迭代、持续演化，并逐渐趋于稳定。\n\n我们期待与全球用户和开发者一起，在开源、可复用、可组合的基础设施之上，共同探索智能上限。欢迎大家用 DeepSeek Harness 将想法变成现实，与社区一起丰富插件生态。",
			welcomeContinue: "继续",
			welcomeError: "暂时无法保存确认状态，请重试。",
			onboardingTitle: "添加一个 API Key 开始使用",
			onboardingDescription: "配置 DeepSeek 官方模型，即可开始使用。",
			onboardingLater: "稍后配置",
			onboardingSave: "保存并继续",
			onboardingSaving: "保存中…",
			keyRequired: "请输入 API 密钥后继续。"
		};
		//#endregion
		//#region ../../../vendor/cosmokit/src/misc.ts
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/volatile.ts
		/** Shared config references used by schema validators and plugin runtimes. */
		const write = Symbol.for("cosmokit.volatile.write");
		function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
			if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
			if (value === null || typeof value !== "object") return value;
			if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
			ancestors.add(value);
			try {
				if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
				if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
				return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
			} finally {
				ancestors.delete(value);
			}
		}
		/**
		* Create a detached reference containing an immutable copy of the supplied data.
		* @param value - validated config data; class instances and functions are unsupported.
		* @returns a reference whose value is updated only by its owning runtime.
		*/
		function createVolatile(value) {
			let current = snapshot(value);
			return Object.freeze({
				get: () => current,
				[write]: (value) => {
					current = value;
				}
			});
		}
		/**
		* Identify references across ESM/CJS copies of the shared library.
		* @param value - a parsed config value.
		* @returns whether the value implements the shared reference protocol.
		*/
		function isVolatile(value) {
			return typeof value === "object" && value !== null && write in value;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/types.ts
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		let Binary;
		(function(_Binary) {
			_Binary.is = isArrayBufferLike;
			_Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			_Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			_Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			_Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			_Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			_Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/**
		* Compare values recursively, treating two volatile references as equal regardless of value.
		* Strict comparison distinguishes null/undefined, treats opaque objects by identity,
		* compares URLs by normalized href, treats array holes as undefined, and considers distinct cyclic structures unequal.
		* @param a - first value.
		* @param b - second value.
		* @param strict - whether to require strict data equality outside volatile references.
		* @returns whether the values compare equal.
		*/
		function deepEqual(a, b, strict) {
			const ancestors = /* @__PURE__ */ new Set();
			function compare(a, b) {
				if (a === b) return true;
				if (isVolatile(a) || isVolatile(b)) return isVolatile(a) && isVolatile(b);
				if (!strict && isNullable(a) && isNullable(b)) return true;
				if (typeof a !== typeof b || typeof a !== "object" || !a || !b) return false;
				if (ancestors.has(a)) return false;
				function check(test, then) {
					return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
				}
				ancestors.add(a);
				try {
					return check(Array.isArray, (a, b) => {
						if (a.length !== b.length) return false;
						for (let index = 0; index < a.length; index++) if (!compare(a[index], b[index])) return false;
						return true;
					}) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("URL"), (a, b) => a.href === b.href) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
						if (a.byteLength !== b.byteLength) return false;
						const viewA = new Uint8Array(a);
						const viewB = new Uint8Array(b);
						for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
						return true;
					}) ?? ((!strict || [a, b].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
						...a,
						...b
					}).every((key) => compare(a[key], b[key])));
				} finally {
					ancestors.delete(a);
				}
			}
			return compare(a, b);
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/time.ts
		let Time;
		(function(_Time) {
			_Time.millisecond = 1;
			const second = _Time.second = 1e3;
			const minute = _Time.minute = second * 60;
			const hour = _Time.hour = minute * 60;
			const day = _Time.day = hour * 24;
			const week = _Time.week = day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			_Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			_Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / minute - offset) / 1440);
			}
			_Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * minute);
			}
			_Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
			}
			_Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			_Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
				else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
				else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
				else if (abs >= second) return Math.round(ms / second) + "s";
				return ms + "ms";
			}
			_Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			_Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			_Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (isVolatile(value)) value = value.get();
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.volatile = function volatile() {
			if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
			return this.extra("volatile", true);
		};
		const resolvers = {};
		const checkedVolatile = Symbol("checked-volatile-schema");
		function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
			const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
			if (states.has(blocked)) return;
			states.add(blocked);
			seen.set(schema, states);
			if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
			const nested = blocked || !!schema.meta?.volatile;
			if (schema.dict) for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
			if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
			if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
			if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
		}
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (!options[checkedVolatile]) {
				validateVolatileSchema(schema, options.path);
				options = {
					...options,
					[checkedVolatile]: true
				};
			}
			if (schema.meta?.volatile) {
				const inner = Schema(schema);
				inner.meta = {
					...schema.meta,
					volatile: false
				};
				const [value, adapted] = Schema.resolve(data, inner, options, strict);
				try {
					return [createVolatile(value), adapted];
				} catch (error) {
					throw new ValidationError(error instanceof Error ? error.message : String(error), options);
				}
			}
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
				validateVolatileSchema(schema.inner, options.path, true);
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region lib/types/onboarding-config.js
		/** Public page-bootstrap options shared by the Host and Client halves. */
		/** Validate Host configuration and its public page-bootstrap payload. */
		const Config = Schema.object({ credentialOnboarding: Schema.boolean().default(true) });
		/** Page-global key carrying only the public onboarding options. */
		const ONBOARDING_CONFIG_GLOBAL = "__DSH_MODELS_ONBOARDING__";
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.models";
		/**
		* Refetch the page snapshot only after its first load: an unopened Models
		* page must not fetch on background invalidations.
		* @param controller - the page store.
		*/
		function refreshIfLoaded(controller) {
			if (controller.store.getSnapshot().status === "idle") return;
			controller.load();
		}
		/**
		* Required services (cordis fiber inject). The target slot is declared by
		* ui-settings' apply, whose activation order relative to this one is NOT
		* constrained; registration depends on each slot through `slots.inject()`.
		*/
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"remote.llm",
			"remote.settings",
			"remote.session",
			"configForms",
			"settingsSchema"
		];
		/**
		* Register the Models section once the `settings.section` declaration is on
		* the ledger, wire its store to the connection, and keep it fresh on every
		* pushed invalidation (settings, credentials, or provider topology).
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			// 关闭开关时仍保留 Harness 原始模型设置入口，不隐藏设置页或数据。
			const payload = globalThis[ONBOARDING_CONFIG_GLOBAL];
			const credentialOnboarding = Config(payload === void 0 ? {} : payload).credentialOnboarding && !("dshDesktop" in globalThis);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-settings-models: copy dictionaries");
			const schema = createSettingsSchemaOperations(ctx.settingsSchema);
			const operations = createModelsOperations(ctx);
			const controller = new ModelsSettingsStore(ctx, schema, ctx.configForms.describe());
			const t = ctx.locale.bind(NS);
			const injected = () => ({
				controller,
				hooks: { snapshot: controller.store },
				operations,
				schema,
				t
			});
			const deepSeekOnboardingInjected = () => ({
				automatic: credentialOnboarding,
				track: (name, attributes) => ctx.get("productAnalytics")?.track(name, attributes),
				controller,
				hooks: { models: controller.store },
				operations,
				schema,
				t
			});
			const welcomeController = new WelcomeNoticeStore(ctx.configForms.get(WELCOME_NOTICE_SETTINGS_NAMESPACE));
			const welcomeInjected = () => ({
				controller: welcomeController,
				hooks: { welcome: welcomeController.store },
				t
			});
			ctx.effect(() => {
				const refreshModels = () => {
					refreshIfLoaded(controller);
				};
				const disposers = [
					ctx.remote.$on("settings/document-updated", () => {
						refreshModels();
					}),
					ctx.remote.$on("credentials/record-updated", refreshModels),
					ctx.remote.$on("credentials/reference-updated", refreshModels),
					ctx.remote.$on("llm/adapters-updated", refreshModels),
					ctx.on("connection/reset", refreshModels)
				];
				return () => {
					welcomeController.dispose();
					for (const dispose of disposers) dispose();
				};
			}, "ui-settings-models: pushed invalidations");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "models",
				order: 10,
				label: () => t("nav"),
				inject: injected,
				children: {
					"settings.models.provider-card": {
						kind: "keyed",
						scope: "root"
					},
					"settings.models.footer": {
						kind: "list",
						scope: "root"
					}
				}
			}, ModelsSection));
			if (!("dshDesktop" in globalThis)) ctx.slots.inject("settings.onboarding", () => ctx.slots.register({
				name: "settings.onboarding",
				id: "welcome-notice",
				order: -100,
				inject: welcomeInjected
			}, WelcomeNotice));
			ctx.slots.inject("settings.onboarding", () => ctx.slots.register({
				name: "settings.onboarding",
				id: "deepseek-official",
				children: { "settings.models.sign-in": {
					kind: "single",
					scope: "root"
				} },
				order: 0,
				inject: deepSeekOnboardingInjected
			}, DeepSeekOnboardingDialog));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.refreshIfLoaded = refreshIfLoaded;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
