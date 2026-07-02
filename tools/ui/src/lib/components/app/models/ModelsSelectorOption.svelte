<script lang="ts">
	import {
		Brain,
		CircleAlert,
		Eye,
		Heart,
		HeartOff,
		Info,
		Loader2,
		Mic,
		Power,
		RotateCw,
		Video
	} from '@lucide/svelte';
	import { ActionIcon, ModelId } from '$lib/components/app';
	import type { ModelOption } from '$lib/types/models';
	import { ModelModality, ServerModelStatus } from '$lib/enums';
	import { modelsStore, propsCacheVersion, routerModels } from '$lib/stores/models.svelte';

	interface Props {
		option: ModelOption;
		isSelected: boolean;
		isHighlighted: boolean;
		isFav: boolean;
		hideOrgName?: boolean;
		onSelect: (modelId: string) => void;
		onMouseEnter: () => void;
		onKeyDown: (e: KeyboardEvent) => void;
		onInfoClick?: (modelName: string) => void;
	}

	let {
		option,
		isSelected,
		isHighlighted,
		isFav,
		hideOrgName = false,
		onSelect,
		onMouseEnter,
		onKeyDown,
		onInfoClick
	}: Props = $props();

	let currentRouterModels = $derived(routerModels());
	let serverStatus = $derived.by(() => {
		const model = currentRouterModels.find((m) => m.id === option.model);
		return (model?.status?.value as ServerModelStatus) ?? null;
	});
	let isOperationInProgress = $derived(modelsStore.isModelOperationInProgress(option.model));
	let isFailed = $derived(serverStatus === ServerModelStatus.FAILED);
	let isSleeping = $derived(serverStatus === ServerModelStatus.SLEEPING);
	let isLoaded = $derived(
		(serverStatus === ServerModelStatus.LOADED || isSleeping) && !isOperationInProgress
	);
	let isLoading = $derived(serverStatus === ServerModelStatus.LOADING || isOperationInProgress);

	// Compact input/output price per million tokens, e.g. "$0.09/$0.34". Rendered
	// only when the provider advertised pricing; a missing side shows "$?".
	let pricingLabel = $derived.by(() => {
		const p = option.pricing;
		if (!p || (p.inputPerM == null && p.outputPerM == null)) return null;
		const fmt = (v: number | undefined) => (typeof v === 'number' ? `$${v.toFixed(2)}` : '$?');
		return `${fmt(p.inputPerM)}/${fmt(p.outputPerM)}`;
	});

	// Capability icons (modalities + reasoning) resolved from the /props cache,
	// which fills in asynchronously after the dropdown opens — read
	// propsCacheVersion so rows re-render as props arrive.
	let capabilityIcons = $derived.by(() => {
		propsCacheVersion();

		const icons: { icon: typeof Eye; label: string }[] = [];
		const modalities = modelsStore.getModelModalitiesArray(option.model);
		if (modalities.includes(ModelModality.VISION)) icons.push({ icon: Eye, label: 'Vision' });
		if (modalities.includes(ModelModality.AUDIO)) icons.push({ icon: Mic, label: 'Audio' });
		if (modalities.includes(ModelModality.VIDEO)) icons.push({ icon: Video, label: 'Video' });

		if (modelsStore.getModelProps(option.model)?.reasoning?.supported) {
			icons.push({ icon: Brain, label: 'Reasoning' });
		}

		return icons;
	});
</script>

<div
	class={[
		'group flex w-full items-center gap-2 rounded-sm p-2 text-left text-sm transition focus:outline-none',
		'cursor-pointer hover:bg-muted focus:bg-muted',
		(isSelected || isHighlighted) && 'bg-accent text-accent-foreground',
		!(isSelected || isHighlighted) && 'hover:bg-accent hover:text-accent-foreground',
		isLoaded ? 'text-popover-foreground' : 'text-muted-foreground'
	]}
	role="option"
	aria-selected={isSelected || isHighlighted}
	tabindex="0"
	onclick={() => onSelect(option.id)}
	onmouseenter={onMouseEnter}
	onkeydown={onKeyDown}
>
	<ModelId
		modelId={option.model}
		{hideOrgName}
		aliases={option.aliases}
		tags={option.tags}
		class="flex-1"
	/>

	{#if capabilityIcons.length > 0}
		<span class="flex shrink-0 items-center gap-1 text-muted-foreground">
			{#each capabilityIcons as { icon: CapIcon, label } (label)}
				<span title={label} aria-label={label}>
					<CapIcon class="h-3 w-3" />
				</span>
			{/each}
		</span>
	{/if}

	{#if pricingLabel}
		<span class="shrink-0 text-xs text-muted-foreground tabular-nums" title="Input/output price per million tokens">
			{pricingLabel}
		</span>
	{/if}

	<div class="flex shrink-0 items-center gap-1">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="pointer-events-none flex items-center justify-center gap-0.75 pl-2 opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 [@media(pointer:coarse)]:pointer-events-auto [@media(pointer:coarse)]:opacity-100"
			onclick={(e) => e.stopPropagation()}
		>
			{#if isFav}
				<ActionIcon
					iconSize="h-2.5 w-2.5"
					icon={HeartOff}
					tooltip="Remove from favorites"
					class="h-3 w-3 hover:text-foreground"
					onclick={() => modelsStore.toggleFavorite(option.model)}
				/>
			{:else}
				<ActionIcon
					iconSize="h-2.5 w-2.5"
					icon={Heart}
					tooltip="Add to favorites"
					class="h-3 w-3 hover:text-foreground"
					onclick={() => modelsStore.toggleFavorite(option.model)}
				/>
			{/if}

			<!-- info button: only shown when model is loaded and callback is provided -->
			{#if isLoaded && onInfoClick}
				<ActionIcon
					iconSize="h-2.5 w-2.5"
					icon={Info}
					tooltip="Model information"
					class="h-3 w-3 hover:text-foreground"
					onclick={() => onInfoClick(option.model)}
				/>
			{/if}
		</div>

		{#if isLoading}
			<div class="flex w-4 [@media(pointer:coarse)]:w-5 items-center justify-center">
				<Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
			</div>
		{:else if isFailed}
			<div class="flex w-4 [@media(pointer:coarse)]:w-auto items-center justify-center">
				<CircleAlert
					class="h-3.5 w-3.5 text-red-500 group-hover:hidden [@media(pointer:coarse)]:hidden"
				/>

				<div class="hidden group-hover:flex [@media(pointer:coarse)]:flex">
					<ActionIcon
						iconSize="h-2.5 w-2.5"
						icon={RotateCw}
						tooltip="Retry loading model"
						class="h-3 w-3 text-red-500 hover:text-foreground"
						onclick={() => modelsStore.loadModel(option.model)}
						stopPropagationOnClick
					/>
				</div>
			</div>
		{:else if isSleeping}
			<!-- Proxy backend: models are remote and always available; there is no
			     unload lifecycle, so no unload control is shown (a real unload would
			     poll forever waiting for a status the server never reports). -->
			<div class="flex w-4 [@media(pointer:coarse)]:w-auto items-center justify-center">
				<span class="h-2 w-2 rounded-full bg-orange-400"></span>
			</div>
		{:else if isLoaded}
			<div class="flex w-4 [@media(pointer:coarse)]:w-auto items-center justify-center">
				<span class="h-2 w-2 rounded-full bg-green-500"></span>
			</div>
		{:else}
			<div class="flex w-4 [@media(pointer:coarse)]:w-auto items-center justify-center">
				<span
					class="h-2 w-2 rounded-full bg-muted-foreground/50 group-hover:hidden [@media(pointer:coarse)]:hidden"
				></span>

				<div class="hidden group-hover:flex [@media(pointer:coarse)]:flex">
					<ActionIcon
						iconSize="h-2.5 w-2.5"
						icon={Power}
						tooltip="Load model"
						class="h-3 w-3 [@media(pointer:coarse)]:text-muted-foreground"
						onclick={() => modelsStore.loadModel(option.model)}
						stopPropagationOnClick
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
