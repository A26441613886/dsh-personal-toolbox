// Model-onboarding adapter only; personal services belong to the local bundle.
import z from '@deepseek-ai/schemastery';
export const Config = z.object({ credentialOnboarding: z.boolean().default(true) });
export function apply(ctx, config = Config({})) {
  ctx.on('webserver/index-inject', table => table.push({ kind: 'global', name: '__DSH_MODELS_ONBOARDING__', value: { credentialOnboarding: config.credentialOnboarding } }));
}
