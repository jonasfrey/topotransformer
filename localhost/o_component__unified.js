// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { a_o_source, o_source__by_id } from "./o_config__source.js";

let o_component__unified = {
    name: 'component-unified',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'main',
        a_o: [
            // ===================== SOURCE SELECTOR (step 1) =====================
            {
                s_tag: 'div',
                class: 'source_selector',
                'v-if': '!s_source',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'source_selector__title',
                        innerText: 'Select Terrain Source',
                    },
                    {
                        s_tag: 'div',
                        class: 'source_selector__card_row',
                        a_o: [
                            {
                                s_tag: 'div',
                                class: 'source_selector__card interactable',
                                'v-for': 'o_src in a_o_source',
                                'v-on:click': 'f_select_source(o_src.s_id)',
                                a_o: [
                                    { s_tag: 'div', class: 'source_selector__card_label', innerText: '{{ o_src.s_label }}' },
                                    { s_tag: 'div', class: 'source_selector__card_desc', innerText: '{{ o_src.s_description }}' },
                                ],
                            },
                        ],
                    },
                ],
            },
            // ===================== MAP VIEW (step 2) =====================
            // leaflet map container (full screen)
            {
                s_tag: 'div',
                class: 'map__container',
                ref: 'map_container',
                'v-if': 's_source',
            },
            // map toolbar (top-right, combined map + 3d controls)
            {
                s_tag: 'div',
                class: 'map__toolbar',
                'v-if': 's_source',
                a_o: [
                    // source switcher (compact)
                    {
                        s_tag: 'select',
                        'v-model': 's_source_switch',
                        'v-on:change': 'f_switch_source',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: 'global', innerText: 'Global' },
                            { s_tag: 'option', value: 'switzerland', innerText: 'Switzerland' },
                            { s_tag: 'option', value: 'mars', innerText: 'Mars' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_export',
                        innerText: "{{ b_exporting ? 'Exporting...' : 'Export' }}",
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_elevation_overlay ? ' active' : '')",
                        'v-on:click': 'f_toggle_elevation_overlay',
                        innerText: 'Heightmap',
                    },
                    // export PNG (mars only)
                    {
                        s_tag: 'div',
                        'v-if': 'o_config && o_config.b_has_export_png',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_export_png',
                        innerText: 'Export PNG',
                    },
                    // search (global + switzerland)
                    {
                        s_tag: 'div',
                        class: 'map__search',
                        'v-if': 'o_config && o_config.b_has_search',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'text',
                                'v-model': 's_search',
                                ':placeholder': "s_source === 'switzerland' ? 'Search Swiss location...' : 'Search location...'",
                                class: 'map__search_input',
                                'v-on:keydown.enter': 'f_search',
                            },
                            {
                                s_tag: 'div',
                                ':class': "'bw3d__toolbar_btn interactable' + (b_searching ? ' disabled' : '')",
                                'v-on:click': 'f_search',
                                innerText: '🔍',
                            },
                        ],
                    },
                    {
                        s_tag: 'select',
                        'v-model': 's_ratio',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: 'free', innerText: 'Free' },
                            { s_tag: 'option', value: '1:1', innerText: '1:1' },
                            { s_tag: 'option', value: '4:3', innerText: '4:3' },
                            { s_tag: 'option', value: '3:2', innerText: '3:2' },
                            { s_tag: 'option', value: '16:9', innerText: '16:9' },
                            { s_tag: 'option', value: '21:9', innerText: '21:9' },
                            { s_tag: 'option', value: '3:4', innerText: '3:4 (portrait)' },
                            { s_tag: 'option', value: '2:3', innerText: '2:3 (portrait)' },
                            { s_tag: 'option', value: '9:16', innerText: '9:16 (portrait)' },
                        ],
                    },
                    {
                        s_tag: 'select',
                        'v-model': 's_preset',
                        'v-on:change': 'f_go_preset',
                        class: 'map__select_ratio',
                        'v-if': 'o_config',
                        a_o: [
                            {
                                s_tag: 'option',
                                'v-for': 'o_p in o_config.a_o_preset',
                                ':value': 'o_p.s_value',
                                ':disabled': 'o_p.b_disabled',
                                innerText: '{{ o_p.s_label }}',
                            },
                        ],
                    },
                    // resolution input (switzerland only)
                    {
                        s_tag: 'label',
                        class: 'map__resolution_label',
                        'v-if': 'o_config && o_config.b_has_resolution_input',
                        innerText: 'Resolution: ',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'number',
                                'v-model.number': 'n_resolution',
                                min: '32',
                                max: '1024',
                                step: '32',
                                class: 'map__resolution_input',
                            },
                            { s_tag: 'span', innerText: 'px' },
                        ],
                    },
                    // separator between map and 3d controls
                    { s_tag: 'div', class: 'main__toolbar_separator' },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn bw3d__toolbar_btn--primary interactable'",
                        'v-on:click': 'f_generate_and_download',
                        innerText: 'Generate & Download',
                    },
                    { s_tag: 'div', class: 'main__toolbar_separator' },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_preview ? ' active' : '')",
                        'v-on:click': 'b_preview = !b_preview',
                        innerText: 'Preview',
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__3d_config ? ' active' : '')",
                        'v-on:click': 'b_overlay__3d_config = !b_overlay__3d_config',
                        innerText: '3D Config',
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__scene ? ' active' : '')",
                        'v-on:click': 'b_overlay__scene = !b_overlay__scene',
                        innerText: 'Scene',
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__tiling ? ' active' : '')",
                        'v-on:click': 'b_overlay__tiling = !b_overlay__tiling',
                        innerText: 'Tiling',
                    },
                    {
                        s_tag: 'div',
                        class: 'map__info',
                        'v-if': 's_status',
                        innerText: '{{ s_status }}',
                    },
                ],
            },
            // zoom info bar (bottom center)
            {
                s_tag: 'div',
                class: 'map__zoom_info',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'span',
                        innerText: '{{ s_zoom_label }}',
                    },
                    {
                        s_tag: 'span',
                        ':class': "'map__zoom_quality ' + s_quality_class",
                        innerText: '{{ s_quality }}',
                    },
                ],
            },
            // aspect ratio selection overlay
            {
                s_tag: 'div',
                class: 'map__selection_overlay',
                'v-if': 's_source',
                a_o: [
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--top', ':style': 'o_style__dim_top' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--bottom', ':style': 'o_style__dim_bottom' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--left', ':style': 'o_style__dim_left' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--right', ':style': 'o_style__dim_right' },
                    { s_tag: 'div', class: 'map__selection_box', ':style': 'o_style__selection_box', a_o: [
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--tl' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--tr' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--bl' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--br' },
                        // tiling grid lines
                        { s_tag: 'div', 'v-if': 'b_tiling__preview && n_tile_col > 1', class: 'map__tile_grid_col', 'v-for': 'n in (n_tile_col - 1)', ':style': '{ left: (n / n_tile_col * 100) + "%", top: "0", bottom: "0" }' },
                        { s_tag: 'div', 'v-if': 'b_tiling__preview && n_tile_row > 1', class: 'map__tile_grid_row', 'v-for': 'n in (n_tile_row - 1)', ':style': '{ top: (n / n_tile_row * 100) + "%", left: "0", right: "0" }' },
                    ]},
                ],
            },
            // live 3D minimap preview (bottom-left)
            {
                s_tag: 'div',
                class: 'minimap',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'canvas',
                        ref: 'canvas__minimap',
                        class: 'minimap__canvas',
                    },
                    {
                        s_tag: 'div',
                        class: 'minimap__status',
                        'v-if': 'b_minimap__loading',
                        innerText: 'loading...',
                    },
                ],
            },
            // preview panel (draggable overlay, bottom-right)
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay main__preview' + (b_preview ? ' visible' : '')",
                ':style': 'o_style__overlay__preview',
                ref: 'overlay__preview',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, 'preview')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: 'Preview' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_preview = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            // heightmap preview
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Heightmap' },
                                    {
                                        s_tag: 'div',
                                        class: 'main__heightmap_container',
                                        'v-if': 's_data_url__heightmap',
                                        a_o: [
                                            { s_tag: 'img', class: 'main__heightmap_img', ':src': 's_data_url__heightmap' },
                                        ],
                                    },
                                    { s_tag: 'div', class: 'bw3d__info', 'v-if': '!s_data_url__heightmap', innerText: 'Click Export to generate heightmap' },
                                ],
                            },
                            // load from file
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Or load from file' },
                                    { s_tag: 'input', type: 'file', accept: 'image/*', 'v-on:change': 'f_load_file($event)', class: 'bw3d__input_file' },
                                ],
                            },
                            // max resolution
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Max resolution' },
                                    { s_tag: 'input', type: 'number', ':value': 'n_max_resolution', 'v-on:change': 'f_set_max_resolution(Number($event.target.value))', min: '8', max: '5000', step: '8', class: 'bw3d__input' },
                                    { s_tag: 'div', class: 'bw3d__info', innerText: 'Image will be downsampled if larger' },
                                ],
                            },
                            // 3d preview
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: '3D Preview' },
                                    {
                                        s_tag: 'div',
                                        class: 'main__3d_container',
                                        ref: 'container__three',
                                        a_o: [
                                            { s_tag: 'canvas', ref: 'canvas__three' },
                                        ],
                                    },
                                ],
                            },
                            // action buttons
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    {
                                        class: 'bw3d__row',
                                        style: 'flex-wrap: wrap',
                                        a_o: [
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_generate_mesh', innerText: 'Generate 3D' },
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_generate_and_download', innerText: 'Generate & Download' },
                                        ],
                                    },
                                ],
                            },
                            // variant preview toggles
                            {
                                class: 'bw3d__section',
                                'v-if': 'b_variant__generated',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Show variant' },
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__large_ve1 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(0)', innerText: 'Large 1x' },
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__large_ve2 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(1)', innerText: 'Large 2x' },
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__medium_ve1 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(2)', innerText: 'Medium 1x' },
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__medium_ve2 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(3)', innerText: 'Medium 2x' },
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__keychain_ve1 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(4)', innerText: 'Key 1x' },
                                            { s_tag: 'div', ':class': "'bw3d__toolbar_btn interactable' + (b_show__keychain_ve2 ? ' active' : '')", 'v-on:click': 'f_toggle_variant_preview(5)', innerText: 'Key 2x' },
                                        ],
                                    },
                                ],
                            },
                            // resolution info
                            {
                                class: 'bw3d__section',
                                'v-if': 's_resolution',
                                a_o: [
                                    { s_tag: 'div', class: 'bw3d__info', innerText: '{{ s_resolution }}' },
                                ],
                            },
                        ],
                    },
                ],
            },
            // overlay: 3d config
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__3d_config ? ' visible' : '')",
                ':style': 'o_style__overlay__3d_config',
                ref: 'overlay__3d_config',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, '3d_config')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: '3D Config' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__3d_config = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Geometry' },
                                    {
                                        s_tag: 'select',
                                        'v-model': 's_type__geometry',
                                        class: 'bw3d__select',
                                        a_o: [
                                            { s_tag: 'option', value: 'sphere', innerText: 'Sphere' },
                                            { s_tag: 'option', value: 'cylinder', innerText: 'Cylinder' },
                                            { s_tag: 'option', value: 'plane', innerText: 'Plane' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Height multiplier: {{ n_factor.toFixed(1) }}x (1.0 = true scale)' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_factor', min: '0', max: '3', step: '0.1', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Max width (mm)' },
                                    { s_tag: 'input', type: 'number', 'v-model.number': 'n_mm__max_width', min: '1', step: '1', class: 'bw3d__input' },
                                    { s_tag: 'div', class: 'bw3d__info', 'v-if': 'n_m_per_pixel__3d > 0', innerText: 'Scale 1:{{ f_s__format_number(f_n__nice_round(n_m_per_pixel__3d * n_scl_x__map_selection * 1000 / n_mm__max_width)) }} — elevation {{ Math.round(n_m__elevation_min) }}m–{{ Math.round(n_m__elevation_max) }}m' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Min side face (mm): {{ n_mm__min_side.toFixed(1) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_mm__min_side', min: '5', max: '30', step: '0.5', class: 'bw3d__range' },
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Baseplate (mm): {{ n_mm__baseplate.toFixed(1) }}' },
                                ],
                            },
                            // chamfer toggle + angle
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'input', type: 'checkbox', 'v-model': 'b_chamfer__enabled', id: 'chk_chamfer_enabled' },
                                            { s_tag: 'label', for: 'chk_chamfer_enabled', class: 'bw3d__label', innerText: 'Chamfer (overhang-free vertical printing)' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_chamfer__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Chamfer angle: {{ n_deg__chamfer }}°' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_deg__chamfer', min: '1', max: '45', step: '1', class: 'bw3d__range' },
                                    { s_tag: 'div', class: 'bw3d__info', innerText: 'Tilts bottom face for overhang-free vertical printing' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'input', type: 'checkbox', 'v-model': 'b_text__enabled', id: 'chk_text_enabled' },
                                            { s_tag: 'label', for: 'chk_text_enabled', class: 'bw3d__label', innerText: 'Carve text into baseplate' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_text__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Text' },
                                    { s_tag: 'textarea', 'v-model': 's_text__carve', class: 'bw3d__input bw3d__textarea', rows: '3', maxlength: '200' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_text__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Carve depth (mm): {{ n_mm__text_depth.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_mm__text_depth', min: '0.05', max: '2', step: '0.05', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'input', type: 'checkbox', 'v-model': 'b_hole__enabled', id: 'chk_hole_enabled' },
                                            { s_tag: 'label', for: 'chk_hole_enabled', class: 'bw3d__label', innerText: 'Corner hole' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_hole__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Diameter (mm): {{ n_mm__hole_diameter.toFixed(1) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_mm__hole_diameter', min: '1', max: '10', step: '0.5', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_hole__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Margin (mm): {{ n_mm__hole_margin.toFixed(1) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_mm__hole_margin', min: '1', max: '10', step: '0.5', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane' && b_hole__enabled",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Corner' },
                                    {
                                        s_tag: 'select',
                                        'v-model': 's_corner__hole',
                                        class: 'bw3d__select',
                                        a_o: [
                                            { s_tag: 'option', value: 'tl', innerText: 'Top-left' },
                                            { s_tag: 'option', value: 'tr', innerText: 'Top-right' },
                                            { s_tag: 'option', value: 'bl', innerText: 'Bottom-left' },
                                            { s_tag: 'option', value: 'br', innerText: 'Bottom-right' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // overlay: scene
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__scene ? ' visible' : '')",
                ':style': 'o_style__overlay__scene',
                ref: 'overlay__scene',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, 'scene')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: 'Scene' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__scene = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Background color' },
                                    { s_tag: 'input', type: 'color', ':value': 's_color__bg', 'v-on:input': 'f_set_color_bg($event.target.value)', class: 'bw3d__input_color' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Mesh color' },
                                    { s_tag: 'input', type: 'color', ':value': 's_color__mesh', 'v-on:input': 'f_set_color_mesh($event.target.value)', class: 'bw3d__input_color' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Wireframe' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_wireframe', 'v-on:change': 'f_set_wireframe' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Height colormap (blue → green → red)' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_colormap__height' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Ambient light: {{ n_intensity__ambient.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_intensity__ambient', 'v-on:input': 'f_set_ambient', min: '0', max: '2', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Directional light: {{ n_intensity__directional.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_intensity__directional', 'v-on:input': 'f_set_directional', min: '0', max: '3', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Auto-rotate' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_autorotate', 'v-on:change': 'f_set_autorotate' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Rotation speed: {{ n_speed__rotation.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_speed__rotation', 'v-on:input': 'f_set_rotation_speed', min: '0', max: '5', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                        ],
                    },
                ],
            },
            // overlay: tiling
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__tiling ? ' visible' : '')",
                ':style': 'o_style__overlay__tiling',
                ref: 'overlay__tiling',
                'v-if': 's_source',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, 'tiling')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: 'Tiling' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__tiling = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', a_o: [
                                        { s_tag: 'input', type: 'checkbox', 'v-model': 'b_tiling__preview', style: 'margin-right: 6px' },
                                        { s_tag: 'span', innerText: 'Show tile grid on map' },
                                    ]},
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Columns' },
                                    { s_tag: 'input', type: 'number', 'v-model.number': 'n_tile_col', min: '1', max: '20', step: '1', class: 'bw3d__input' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Rows' },
                                    { s_tag: 'input', type: 'number', 'v-model.number': 'n_tile_row', min: '1', max: '20', step: '1', class: 'bw3d__input' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'div', class: 'bw3d__info', innerText: '{{ n_tile_col * n_tile_row }} tile(s)' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    {
                                        s_tag: 'div',
                                        ':class': "'bw3d__btn interactable' + (b_tiling__running ? ' disabled' : '')",
                                        'v-on:click': 'f_start_tiling',
                                        innerText: "{{ b_tiling__running ? 'Exporting...' : 'Export all tiles' }}",
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': 'b_tiling__running || s_tiling__status',
                                a_o: [
                                    { s_tag: 'div', class: 'bw3d__info', innerText: '{{ s_tiling__status }}' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    })).outerHTML,

    data: function () {
        return {
            // --- source selection ---
            s_source: '',
            s_source_switch: '',
            o_config: null,
            a_o_source: a_o_source,

            // --- map state ---
            _o_map: null,
            b_exporting: false,
            s_status: '',
            n_zoom: 7,
            n_m_per_pixel: 1200,
            s_quality: '',
            s_quality_class: '',
            s_scale__map: '',
            s_ratio: '1:1',
            n_scl_x__viewport: 0,
            n_scl_y__viewport: 0,
            s_search: '',
            b_searching: false,
            s_preset: '',
            s_name__location: '',
            b_elevation_overlay: false,
            _o_layer__elevation: null,
            n_resolution: 1320,

            // --- preview panel ---
            b_preview: false,
            o_style__overlay__preview: { left: '20px', top: '100px' },
            s_data_url__heightmap: '',
            s_resolution: '',

            // --- 3d overlay visibility ---
            b_overlay__3d_config: false,
            b_overlay__scene: false,
            b_overlay__tiling: false,
            o_style__overlay__3d_config: { left: '20px', top: '100px' },
            o_style__overlay__scene: { left: '340px', top: '100px' },
            o_style__overlay__tiling: { left: '340px', top: '400px' },

            // --- 3d image data ---
            a_n__image_data: null,
            n_scl_x__image: 0,
            n_scl_y__image: 0,
            n_scl_x__full: 0,
            n_scl_y__full: 0,

            // --- 3d config ---
            s_type__geometry: 'plane',
            n_max_resolution: 5000,
            n_factor: 1.0,
            n_mm__max_width: 240,
            n_mm__min_side: 8,
            b_chamfer__enabled: false,
            n_deg__chamfer: 45,
            b_text__enabled: true,
            s_text__carve: 'TopoPrints',
            n_mm__text_depth: 0.2,
            b_hole__enabled: false,
            n_mm__hole_diameter: 5,
            n_mm__hole_margin: 2,
            s_corner__hole: 'tl',

            // --- export metadata for 3d scale ---
            n_m_per_pixel__3d: 0,
            n_m__elevation_min: 0,
            n_m__elevation_max: 0,
            n_scl_x__map_selection: 0,

            // --- tiling ---
            n_tile_col: 3,
            n_tile_row: 3,
            b_tiling__running: false,
            s_tiling__status: '',
            b_tiling__preview: false,

            // --- scene ---
            s_color__bg: '#0a0a12',
            s_color__mesh: '#8b74ea',
            b_wireframe: false,
            b_colormap__height: true,
            n_intensity__ambient: 0.4,
            n_intensity__directional: 0.8,
            b_autorotate: false,
            n_speed__rotation: 1,

            // --- internal (non-reactive three.js refs) ---
            _o_renderer: null,
            _o_scene: null,
            _o_camera: null,
            _o_control: null,
            _o_light__ambient: null,
            _o_light__directional: null,
            _o_mesh: null,
            _o_group: null,
            _o_group__large_ve1: null,
            _o_group__large_ve2: null,
            _o_group__medium_ve1: null,
            _o_group__medium_ve2: null,
            _o_group__keychain_ve1: null,
            _o_group__keychain_ve2: null,
            b_show__large_ve1: true,
            b_show__large_ve2: false,
            b_show__medium_ve1: false,
            b_show__medium_ve2: false,
            b_show__keychain_ve1: false,
            b_show__keychain_ve2: false,
            b_variant__generated: false,
            _o_image__original: null,
            _el_canvas__grayscale: null,
            _n_id__animation: null,
            _o_resize_observer: null,
            _THREE: null,

            // --- minimap 3d preview ---
            b_minimap__loading: false,
            _o_renderer__minimap: null,
            _o_scene__minimap: null,
            _o_camera__minimap: null,
            _o_mesh__minimap: null,
            _o_control__minimap: null,
            _n_id__animation__minimap: null,
            _n_id__debounce__minimap: null,

            // --- drag state ---
            _s_drag_overlay: null,
            _n_drag_off_x: 0,
            _n_drag_off_y: 0,
        };
    },

    computed: {
        n_ratio__aspect: function () {
            if (this.s_ratio === 'free') return 0;
            let a_s = this.s_ratio.split(':');
            return parseFloat(a_s[0]) / parseFloat(a_s[1]);
        },
        o_selection: function () {
            let n_vw = this.n_scl_x__viewport;
            let n_vh = this.n_scl_y__viewport;
            if (n_vw === 0 || n_vh === 0) return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            let n_ratio = this.n_ratio__aspect;
            if (n_ratio === 0) {
                return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            }
            let n_box_w, n_box_h;
            if (n_vw / n_vh > n_ratio) {
                n_box_h = n_vh * 0.85;
                n_box_w = n_box_h * n_ratio;
            } else {
                n_box_w = n_vw * 0.85;
                n_box_h = n_box_w / n_ratio;
            }
            return {
                n_x: Math.round((n_vw - n_box_w) / 2),
                n_y: Math.round((n_vh - n_box_h) / 2),
                n_scl_x: Math.round(n_box_w),
                n_scl_y: Math.round(n_box_h),
            };
        },
        o_style__selection_box: function () {
            let o = this.o_selection;
            return { left: o.n_x + 'px', top: o.n_y + 'px', width: o.n_scl_x + 'px', height: o.n_scl_y + 'px' };
        },
        o_style__dim_top: function () {
            let o = this.o_selection;
            return { left: '0', top: '0', right: '0', height: o.n_y + 'px' };
        },
        o_style__dim_bottom: function () {
            let o = this.o_selection;
            return { left: '0', top: (o.n_y + o.n_scl_y) + 'px', right: '0', bottom: '0' };
        },
        o_style__dim_left: function () {
            let o = this.o_selection;
            return { left: '0', top: o.n_y + 'px', width: o.n_x + 'px', height: o.n_scl_y + 'px' };
        },
        o_style__dim_right: function () {
            let o = this.o_selection;
            return { left: (o.n_x + o.n_scl_x) + 'px', top: o.n_y + 'px', right: '0', height: o.n_scl_y + 'px' };
        },
        s_zoom_label: function () {
            if (!this.o_config) return '';
            return this.o_config.s_zoom_label(this);
        },
        n_deg__chamfer_effective: function () {
            return this.b_chamfer__enabled ? this.n_deg__chamfer : 0;
        },
        n_mm__baseplate: function () {
            let n_mm__displacement = this.f_n_mm__displacement(this.n_mm__max_width, this.n_factor);
            return this.f_n_mm__baseplate(n_mm__displacement, this.n_mm__min_side);
        },
    },

    mounted: function () {
        let self = this;

        // check URL for source parameter
        let o_url = new URL(window.location.href);
        let s_hash = window.location.hash;
        let o_params = new URLSearchParams(s_hash.includes('?') ? s_hash.split('?')[1] : '');
        let s_source = o_params.get('source');
        if (s_source && o_source__by_id[s_source]) {
            self.f_select_source(s_source);
        }

        // init three.js
        self.f_init_three();

        // position preview panel bottom-right
        self.$nextTick(function () {
            let n_x = Math.max(20, window.innerWidth - 460);
            let n_y = Math.max(60, window.innerHeight - 580);
            self.o_style__overlay__preview = { left: n_x + 'px', top: n_y + 'px' };
        });
    },

    beforeUnmount: function () {
        if (this._f_on_resize) window.removeEventListener('resize', this._f_on_resize);
        if (this._o_layer__elevation && this._o_map) {
            this._o_map.removeLayer(this._o_layer__elevation);
            this._o_layer__elevation = null;
        }
        if (this._o_map) {
            this._o_map.remove();
            this._o_map = null;
        }
        if (this._n_id__animation) cancelAnimationFrame(this._n_id__animation);
        if (this._n_id__animation__minimap) cancelAnimationFrame(this._n_id__animation__minimap);
        if (this._n_id__debounce__minimap) clearTimeout(this._n_id__debounce__minimap);
        if (this._o_control__minimap) this._o_control__minimap.dispose();
        if (this._o_renderer__minimap) this._o_renderer__minimap.dispose();
        if (this._o_mesh__minimap) {
            this._o_mesh__minimap.geometry.dispose();
            this._o_mesh__minimap.material.dispose();
        }
        if (this._o_resize_observer) this._o_resize_observer.disconnect();
        if (this._o_renderer) this._o_renderer.dispose();
        if (this._o_control) this._o_control.dispose();
        let a_s_key__cleanup = ['_o_group', '_o_group__large_ve1', '_o_group__large_ve2', '_o_group__medium_ve1', '_o_group__medium_ve2', '_o_group__keychain_ve1', '_o_group__keychain_ve2'];
        for (let n_i = 0; n_i < a_s_key__cleanup.length; n_i++) {
            if (this[a_s_key__cleanup[n_i]]) {
                this[a_s_key__cleanup[n_i]].traverse(function (o_child) {
                    if (o_child.geometry) o_child.geometry.dispose();
                    if (o_child.material) o_child.material.dispose();
                });
            }
        }
    },

    methods: {
        // ===================== SOURCE SELECTION =====================

        f_select_source: function (s_id) {
            let self = this;
            self.s_source = s_id;
            self.s_source_switch = s_id;
            self.o_config = o_source__by_id[s_id];

            // update URL
            let s_hash = window.location.hash.split('?')[0];
            window.location.hash = s_hash + '?source=' + s_id;

            // init map after DOM update
            self.$nextTick(function () {
                self.f_init_map();
            });
        },

        f_switch_source: function () {
            let self = this;
            let s_new = self.s_source_switch;
            if (s_new === self.s_source) return;

            // cleanup old map
            if (self._o_layer__elevation && self._o_map) {
                self._o_map.removeLayer(self._o_layer__elevation);
                self._o_layer__elevation = null;
            }
            if (self._o_map) {
                self._o_map.remove();
                self._o_map = null;
            }
            if (self._f_on_resize) {
                window.removeEventListener('resize', self._f_on_resize);
                self._f_on_resize = null;
            }

            // reset map state
            self.b_elevation_overlay = false;
            self.s_status = '';
            self.s_search = '';
            self.s_preset = '';

            self.s_source = s_new;
            self.o_config = o_source__by_id[s_new];

            // update URL
            let s_hash = window.location.hash.split('?')[0];
            window.location.hash = s_hash + '?source=' + s_new;

            self.$nextTick(function () {
                self.f_init_map();
            });
        },

        // ===================== MAP INIT =====================

        f_init_map: function () {
            let self = this;
            let o_cfg = self.o_config;
            if (!o_cfg) return;

            let f_load_leaflet = function () {
                return new Promise(function (resolve, reject) {
                    if (!document.querySelector('link[href*="leaflet"]')) {
                        let o_link = document.createElement('link');
                        o_link.rel = 'stylesheet';
                        o_link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                        document.head.appendChild(o_link);
                    }
                    if (window.L) return resolve();
                    let o_script = document.createElement('script');
                    o_script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    o_script.onload = function () { resolve(); };
                    o_script.onerror = function () { reject(new Error('Failed to load Leaflet')); };
                    document.head.appendChild(o_script);
                });
            };

            f_load_leaflet().then(function () {
                let o_map_options = {
                    center: [o_cfg.n_lat__center, o_cfg.n_lon__center],
                    zoom: o_cfg.n_zoom__default,
                    zoomControl: true,
                    zoomSnap: 0,
                    zoomDelta: 0.1,
                    wheelPxPerZoomLevel: 240,
                    minZoom: o_cfg.n_zoom__min,
                    maxZoom: o_cfg.n_zoom__max,
                };

                if (o_cfg.o_bounds) {
                    let o_bounds = L.latLngBounds(
                        L.latLng(o_cfg.o_bounds.n_lat__south, o_cfg.o_bounds.n_lon__west),
                        L.latLng(o_cfg.o_bounds.n_lat__north, o_cfg.o_bounds.n_lon__east)
                    );
                    o_map_options.maxBounds = o_bounds.pad(0.1);
                }

                let o_map = L.map(self.$refs.map_container, o_map_options);

                let o_tile_options = {
                    attribution: o_cfg.s_attribution,
                    maxZoom: o_cfg.n_zoom__max,
                };

                if (o_cfg.b_tms) {
                    o_tile_options.noWrap = true;
                    o_tile_options.tms = true;
                }

                if (o_cfg.o_bounds) {
                    o_tile_options.bounds = L.latLngBounds(
                        L.latLng(o_cfg.o_bounds.n_lat__south, o_cfg.o_bounds.n_lon__west),
                        L.latLng(o_cfg.o_bounds.n_lat__north, o_cfg.o_bounds.n_lon__east)
                    );
                }

                L.tileLayer(o_cfg.s_url__tile, o_tile_options).addTo(o_map);

                self._o_map = o_map;

                o_map.on('zoomend moveend', function () {
                    o_cfg.f_update_zoom_info(self);
                    self.f_debounce_minimap_update();
                });
                o_cfg.f_update_zoom_info(self);

                self.f_update_viewport_size();
                self._f_on_resize = function () { self.f_update_viewport_size(); };
                window.addEventListener('resize', self._f_on_resize);

                setTimeout(function () {
                    o_map.invalidateSize();
                    self.f_update_viewport_size();
                    self.f_debounce_minimap_update();
                }, 100);
            });
        },

        // ===================== MAP METHODS =====================

        f_toggle_elevation_overlay: function () {
            if (this.o_config) {
                this.o_config.f_toggle_elevation_overlay(this);
            }
        },

        f_go_preset: function () {
            let o_self = this;
            if (!o_self.s_preset || !o_self._o_map) return;
            let a_s = o_self.s_preset.split(',');
            let n_lat = parseFloat(a_s[0]);
            let n_lon = parseFloat(a_s[1]);
            let n_zoom = parseInt(a_s[2]);
            o_self.s_name__location = a_s.length > 3 ? a_s.slice(3).join(',') : '';
            o_self._o_map.setView([n_lat, n_lon], n_zoom);
            o_self.s_preset = '';
        },

        f_search: async function () {
            if (this.o_config && this.o_config.f_search) {
                await this.o_config.f_search(this);
            }
        },

        f_update_viewport_size: function () {
            let el = this.$refs.map_container;
            if (!el) return;
            this.n_scl_x__viewport = el.clientWidth;
            this.n_scl_y__viewport = el.clientHeight;
        },

        f_export_png: async function () {
            if (this.b_exporting || !this._o_map || !this.o_config) return;
            this.b_exporting = true;
            this.s_status = 'Calculating visible tiles...';
            try {
                let o_result = await this.o_config.f_s_data_url__from_elevation(this);
                let o_a = document.createElement('a');
                o_a.download = (this.s_source || 'elevation') + '_elevation.png';
                o_a.href = o_result.s_data_url;
                o_a.click();
            } catch (o_error) {
                this.s_status = 'Error: ' + o_error.message;
                console.error(o_error);
            }
            this.b_exporting = false;
        },

        f_export: async function () {
            if (this.b_exporting || !this._o_map || !this.o_config) return;
            this.b_exporting = true;
            this.s_status = 'Calculating visible tiles...';

            try {
                let o_result = await this.o_config.f_s_data_url__from_elevation(this);

                // store heightmap for preview
                this.s_data_url__heightmap = o_result.s_data_url;

                // store export metadata for 3d scale
                this.n_m_per_pixel__3d = o_result.n_m_per_pixel;
                this.n_m__elevation_min = o_result.n_m__elevation_min;
                this.n_m__elevation_max = o_result.n_m__elevation_max;
                this.n_scl_x__map_selection = o_result.n_scl_x__selection;

                // process image for 3d generation
                let o_self = this;
                let o_image = new Image();
                await new Promise(function (f_resolve) {
                    o_image.onload = function () {
                        o_self.f_process_image(o_image);

                        // set factor to 1.0 (true scale) — user can adjust
                        if (o_self.n_m_per_pixel__3d > 0 && o_self.n_scl_x__map_selection > 0) {
                            o_self.n_factor = 1.0;

                            // build carve text
                            let n_m__real_width = o_self.n_m_per_pixel__3d * o_self.n_scl_x__map_selection;
                            let n_scale = n_m__real_width * 1000 / o_self.n_mm__max_width;
                            let n_scale__nice = o_self.f_n__nice_round(n_scale);
                            let a_s__line = ['TopoPrints'];
                            if (o_self.s_name__location) a_s__line.push(o_self.s_name__location);
                            a_s__line.push('1:' + o_self.f_s__format_number(n_scale__nice));
                            a_s__line.push('VE: ' + o_self.n_factor.toFixed(1));
                            o_self.s_text__carve = a_s__line.join('\n');
                        }
                        f_resolve();
                    };
                    o_image.src = o_result.s_data_url;
                });

                // open preview panel
                this.b_preview = true;
            } catch (o_error) {
                this.s_status = 'Error: ' + o_error.message;
                console.error(o_error);
            }

            this.b_exporting = false;
        },

        f_download_png: function () {
            if (!this.s_data_url__heightmap) return;
            let o_a = document.createElement('a');
            o_a.download = 'elevation.png';
            o_a.href = this.s_data_url__heightmap;
            o_a.click();
        },

        // ===================== THREE.JS METHODS =====================

        f_init_three: async function () {
            let o_self = this;
            let THREE = await import('three');
            let { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

            let el_canvas = o_self.$refs.canvas__three;
            let el_container = o_self.$refs.container__three;

            // three.js may init before map is shown, wait for elements
            if (!el_canvas || !el_container) {
                o_self._THREE = THREE;
                o_self._f_pending_three_init = function () {
                    o_self.f_init_three_renderer(THREE, OrbitControls);
                };
                return;
            }

            o_self.f_init_three_renderer(THREE, OrbitControls);
        },

        f_init_three_renderer: function (THREE, OrbitControls) {
            let o_self = this;
            let el_canvas = o_self.$refs.canvas__three;
            let el_container = o_self.$refs.container__three;
            if (!el_canvas || !el_container) return;

            let n_width = el_container.clientWidth || 400;
            let n_height = el_container.clientHeight || 280;

            let o_renderer = new THREE.WebGLRenderer({ canvas: el_canvas, antialias: true });
            o_renderer.setPixelRatio(window.devicePixelRatio);
            o_renderer.setSize(n_width, n_height);

            let o_scene = new THREE.Scene();
            o_scene.background = new THREE.Color(o_self.s_color__bg);

            let o_camera = new THREE.PerspectiveCamera(60, n_width / n_height, 0.1, 1000);
            o_camera.position.set(0, 0, 3);

            let o_control = new OrbitControls(o_camera, o_renderer.domElement);
            o_control.enableDamping = true;
            o_control.dampingFactor = 0.08;
            o_control.autoRotate = o_self.b_autorotate;
            o_control.autoRotateSpeed = o_self.n_speed__rotation;

            let o_light__ambient = new THREE.AmbientLight(0xffffff, o_self.n_intensity__ambient);
            o_scene.add(o_light__ambient);

            let o_light__directional = new THREE.DirectionalLight(0xffffff, o_self.n_intensity__directional);
            o_light__directional.position.set(5, 5, 5);
            o_scene.add(o_light__directional);

            o_self._o_renderer = o_renderer;
            o_self._o_scene = o_scene;
            o_self._o_camera = o_camera;
            o_self._o_control = o_control;
            o_self._o_light__ambient = o_light__ambient;
            o_self._o_light__directional = o_light__directional;
            o_self._THREE = THREE;

            let o_observer = new ResizeObserver(function () {
                let n_w = el_container.clientWidth;
                let n_h = el_container.clientHeight;
                if (n_w > 0 && n_h > 0) {
                    o_camera.aspect = n_w / n_h;
                    o_camera.updateProjectionMatrix();
                    o_renderer.setSize(n_w, n_h);
                }
            });
            o_observer.observe(el_container);
            o_self._o_resize_observer = o_observer;

            let f_animate = function () {
                o_self._n_id__animation = requestAnimationFrame(f_animate);
                o_control.update();
                o_renderer.render(o_scene, o_camera);
            };
            f_animate();
        },

        f_load_file: function (o_evt) {
            let o_self = this;
            let o_file = o_evt.target.files[0];
            if (!o_file) return;
            let o_reader = new FileReader();
            o_reader.onload = function (o_evt_load) {
                let s_data_url = o_evt_load.target.result;
                o_self.s_data_url__heightmap = s_data_url;
                o_self.n_m_per_pixel__3d = 0;
                o_self.n_m__elevation_min = 0;
                o_self.n_m__elevation_max = 0;
                o_self.n_scl_x__map_selection = 0;

                let o_image = new Image();
                o_image.onload = function () { o_self.f_process_image(o_image); };
                o_image.src = s_data_url;
            };
            o_reader.readAsDataURL(o_file);
            o_self.b_preview = true;
        },

        f_set_max_resolution: function (n_val) {
            this.n_max_resolution = n_val;
            if (this._o_image__original) {
                this.f_extract_full_image();
            }
        },

        f_process_image: function (o_image) {
            let o_self = this;
            o_self._o_image__original = o_image;
            let n_scl_x = o_image.width;
            let n_scl_y = o_image.height;
            o_self.n_scl_x__full = n_scl_x;
            o_self.n_scl_y__full = n_scl_y;

            let el_canvas = document.createElement('canvas');
            el_canvas.width = n_scl_x;
            el_canvas.height = n_scl_y;
            let o_ctx = el_canvas.getContext('2d');
            o_ctx.drawImage(o_image, 0, 0, n_scl_x, n_scl_y);

            let o_imagedata = o_ctx.getImageData(0, 0, n_scl_x, n_scl_y);
            let a_n__rgba = o_imagedata.data;

            for (let n_idx = 0; n_idx < n_scl_x * n_scl_y; n_idx++) {
                let n_off = n_idx * 4;
                let n_val = Math.round(
                    a_n__rgba[n_off] * 0.299 +
                    a_n__rgba[n_off + 1] * 0.587 +
                    a_n__rgba[n_off + 2] * 0.114
                );
                a_n__rgba[n_off] = n_val;
                a_n__rgba[n_off + 1] = n_val;
                a_n__rgba[n_off + 2] = n_val;
                a_n__rgba[n_off + 3] = 255;
            }
            o_ctx.putImageData(o_imagedata, 0, 0);
            o_self._el_canvas__grayscale = el_canvas;

            o_self.f_extract_full_image();

            // lazy init three.js renderer if it was pending
            if (o_self._f_pending_three_init) {
                o_self.$nextTick(function () {
                    if (o_self._f_pending_three_init) {
                        o_self._f_pending_three_init();
                        o_self._f_pending_three_init = null;
                    }
                });
            }
        },

        f_extract_full_image: function () {
            let o_self = this;
            if (!o_self._el_canvas__grayscale) return;
            let n_scl_x = o_self.n_scl_x__full;
            let n_scl_y = o_self.n_scl_y__full;

            let o_ctx = o_self._el_canvas__grayscale.getContext('2d');
            let o_imagedata = o_ctx.getImageData(0, 0, n_scl_x, n_scl_y);
            let a_n__rgba = o_imagedata.data;

            let n_out_x = n_scl_x;
            let n_out_y = n_scl_y;
            let n_max = o_self.n_max_resolution;

            if (n_out_x > n_max || n_out_y > n_max) {
                let n_ratio = Math.min(n_max / n_out_x, n_max / n_out_y);
                n_out_x = Math.floor(n_out_x * n_ratio);
                n_out_y = Math.floor(n_out_y * n_ratio);
            }

            let a_n__gray;
            if (n_out_x !== n_scl_x || n_out_y !== n_scl_y) {
                let el_tmp = document.createElement('canvas');
                el_tmp.width = n_scl_x;
                el_tmp.height = n_scl_y;
                el_tmp.getContext('2d').putImageData(o_imagedata, 0, 0);
                let el_tmp2 = document.createElement('canvas');
                el_tmp2.width = n_out_x;
                el_tmp2.height = n_out_y;
                el_tmp2.getContext('2d').drawImage(el_tmp, 0, 0, n_out_x, n_out_y);
                let o_data2 = el_tmp2.getContext('2d').getImageData(0, 0, n_out_x, n_out_y);
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = o_data2.data[n_idx * 4];
                }
            } else {
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = a_n__rgba[n_idx * 4];
                }
            }

            o_self.a_n__image_data = a_n__gray;
            o_self.n_scl_x__image = n_out_x;
            o_self.n_scl_y__image = n_out_y;
            o_self.s_resolution = n_scl_x + 'x' + n_scl_y + ' → ' + n_out_x + 'x' + n_out_y + ' (grayscale)';
        },

        f_generate_mesh: function () {
            let o_self = this;
            if (!o_self.a_n__image_data || !o_self._THREE) return;

            let THREE = o_self._THREE;
            let o_scene = o_self._o_scene;

            if (o_self._o_group) {
                o_scene.remove(o_self._o_group);
                o_self._o_group.traverse(function (o_child) {
                    if (o_child.geometry) o_child.geometry.dispose();
                    if (o_child.material) o_child.material.dispose();
                });
                o_self._o_group = null;
                o_self._o_mesh = null;
            }

            let n_scl_x = o_self.n_scl_x__image;
            let n_scl_y = o_self.n_scl_y__image;
            let a_n__data = o_self.a_n__image_data;
            let n_factor = o_self.n_factor;
            let s_type = o_self.s_type__geometry;

            let o_geometry = null;
            if (s_type === 'sphere') {
                o_geometry = new THREE.SphereGeometry(1, n_scl_x - 1, n_scl_y - 1);
            } else if (s_type === 'cylinder') {
                o_geometry = new THREE.CylinderGeometry(1, 1, 2, n_scl_x - 1, n_scl_y - 1, true);
            } else if (s_type === 'plane') {
                let n_ratio = n_scl_x / n_scl_y;
                let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
                let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
                o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);
            }

            o_geometry.computeBoundingBox();
            let o_box = o_geometry.boundingBox;
            let n_size_x = o_box.max.x - o_box.min.x;
            let n_size_y = o_box.max.y - o_box.min.y;
            let n_size_z = o_box.max.z - o_box.min.z;
            let n_max_dim = Math.max(n_size_x, n_size_y, n_size_z);
            let n_scl = o_self.n_mm__max_width / n_max_dim;
            o_geometry.scale(n_scl, n_scl, n_scl);

            let n_mm__displacement = o_self.f_n_mm__displacement(o_self.n_mm__max_width, n_factor);
            o_self.f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_mm__displacement, s_type);

            if (o_self.b_colormap__height) {
                o_self.f_apply_vertex_color(o_geometry, s_type);
            }

            o_geometry.computeVertexNormals();

            let o_material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(o_self.s_color__mesh),
                wireframe: o_self.b_wireframe,
                side: THREE.DoubleSide,
                flatShading: true,
                vertexColors: o_self.b_colormap__height,
            });

            let o_group = new THREE.Group();

            if (s_type === 'plane' && o_self.n_mm__baseplate > 0) {
                let a_n__text_mask = null;
                if (o_self.b_text__enabled && o_self.s_text__carve.length > 0) {
                    let n_ratio = n_scl_x / n_scl_y;
                    let n_mm_plate_x = n_ratio >= 1 ? o_self.n_mm__max_width : o_self.n_mm__max_width * n_ratio;
                    let n_mm_plate_y = n_ratio >= 1 ? o_self.n_mm__max_width / n_ratio : o_self.n_mm__max_width;
                    let n_m__real_width = o_self.n_m_per_pixel__3d * o_self.n_scl_x__map_selection;
                    let n_mm__chamfer_depth_local = o_self.n_deg__chamfer_effective > 0 ? (o_self.n_mm__baseplate + n_mm__displacement) / Math.tan(o_self.n_deg__chamfer_effective * Math.PI / 180) : 0;
                    a_n__text_mask = o_self.f_a_n__text_mask(n_scl_x, n_scl_y, n_mm_plate_x, n_mm_plate_y, o_self.s_text__carve, n_m__real_width, n_mm__chamfer_depth_local);
                }
                let o_hole = null;
                if (o_self.b_hole__enabled) {
                    o_geometry.computeBoundingBox();
                    let o_bb = o_geometry.boundingBox;
                    let n_hole_radius = o_self.n_mm__hole_diameter / 2;
                    let n_hole_margin = o_self.n_mm__hole_margin;
                    let n_hole_cx, n_hole_cy;
                    let s_corner = o_self.s_corner__hole;
                    if (s_corner === 'tl') {
                        n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
                        n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
                    } else if (s_corner === 'tr') {
                        n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
                        n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
                    } else if (s_corner === 'bl') {
                        n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
                        n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
                    } else {
                        n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
                        n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
                    }
                    o_hole = { n_cx: n_hole_cx, n_cy: n_hole_cy, n_radius: n_hole_radius };
                }

                let o_geom__solid = o_self.f_o_geometry__solid_plane(o_geometry, o_self.n_mm__baseplate, o_self.n_deg__chamfer_effective, a_n__text_mask, o_self.n_mm__text_depth, o_hole);

                if (o_self.b_colormap__height) {
                    o_self.f_apply_vertex_color(o_geom__solid, s_type);
                }
                o_geom__solid.computeVertexNormals();

                let o_mat__solid = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(o_self.s_color__mesh),
                    wireframe: o_self.b_wireframe,
                    side: THREE.DoubleSide,
                    flatShading: true,
                    vertexColors: o_self.b_colormap__height,
                });

                let o_mesh__solid = new THREE.Mesh(o_geom__solid, o_mat__solid);
                o_group.add(o_mesh__solid);
                o_self._o_mesh = o_mesh__solid;
                o_geometry.dispose();
            } else {
                let o_mesh = new THREE.Mesh(o_geometry, o_material);
                o_group.add(o_mesh);
                o_self._o_mesh = o_mesh;
            }

            o_scene.add(o_group);
            o_self._o_group = o_group;
        },

        f_apply_displacement: function (o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type) {
            let o_self = this;
            let THREE = o_self._THREE;
            let o_pos = o_geometry.attributes.position;
            let n_cnt__vertex = o_pos.count;
            let n_col = n_scl_x;
            let o_vec = new THREE.Vector3();

            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                let n_idx_row = Math.floor(n_idx / n_col);
                let n_idx_col = n_idx % n_col;
                n_idx_row = Math.min(n_idx_row, n_scl_y - 1);
                n_idx_col = Math.min(n_idx_col, n_scl_x - 1);

                let n_idx__pixel = n_idx_row * n_scl_x + n_idx_col;
                let n_val = (n_idx__pixel < a_n__data.length) ? a_n__data[n_idx__pixel] : 127;
                let n_offset = ((n_val - 127) / 128) * n_factor;

                o_vec.set(o_pos.getX(n_idx), o_pos.getY(n_idx), o_pos.getZ(n_idx));

                if (s_type === 'sphere') {
                    let n_len = o_vec.length();
                    if (n_len > 0) {
                        o_pos.setXYZ(n_idx,
                            o_vec.x + (o_vec.x / n_len) * n_offset,
                            o_vec.y + (o_vec.y / n_len) * n_offset,
                            o_vec.z + (o_vec.z / n_len) * n_offset
                        );
                    }
                } else if (s_type === 'cylinder') {
                    let n_len_xz = Math.sqrt(o_vec.x * o_vec.x + o_vec.z * o_vec.z);
                    if (n_len_xz > 0) {
                        o_pos.setXYZ(n_idx,
                            o_vec.x + (o_vec.x / n_len_xz) * n_offset,
                            o_vec.y,
                            o_vec.z + (o_vec.z / n_len_xz) * n_offset
                        );
                    }
                } else if (s_type === 'plane') {
                    o_pos.setZ(n_idx, o_vec.z + n_offset);
                }
            }
            o_pos.needsUpdate = true;
        },

        f_o_geometry__solid_plane: function (o_geom__top, n_thickness, n_deg__chamfer, a_n__text_mask, n_mm__text_depth, o_hole) {
            // This is imported from stl_pipeline but also used for preview.
            // Delegate to the imported shared function.
            let o_self = this;
            let THREE = o_self._THREE;
            let { f_o_geometry__solid_plane } = await_import_cache;
            return f_o_geometry__solid_plane(THREE, o_geom__top, n_thickness, n_deg__chamfer, a_n__text_mask, n_mm__text_depth, o_hole);
        },

        f_apply_vertex_color: function (o_geometry, s_type) {
            let o_self = this;
            let THREE = o_self._THREE;
            let o_pos = o_geometry.attributes.position;
            let n_cnt = o_pos.count;

            let a_n__height = new Float32Array(n_cnt);
            let n_min = Infinity;
            let n_max = -Infinity;

            for (let n_idx = 0; n_idx < n_cnt; n_idx++) {
                let n_h;
                if (s_type === 'plane') {
                    n_h = o_pos.getZ(n_idx);
                } else if (s_type === 'sphere') {
                    let n_x = o_pos.getX(n_idx);
                    let n_y = o_pos.getY(n_idx);
                    let n_z = o_pos.getZ(n_idx);
                    n_h = Math.sqrt(n_x * n_x + n_y * n_y + n_z * n_z);
                } else if (s_type === 'cylinder') {
                    let n_x = o_pos.getX(n_idx);
                    let n_z = o_pos.getZ(n_idx);
                    n_h = Math.sqrt(n_x * n_x + n_z * n_z);
                }
                a_n__height[n_idx] = n_h;
                if (n_h < n_min) n_min = n_h;
                if (n_h > n_max) n_max = n_h;
            }

            let n_range = n_max - n_min;
            if (n_range === 0) n_range = 1;

            let a_n__color = new Float32Array(n_cnt * 3);
            for (let n_idx = 0; n_idx < n_cnt; n_idx++) {
                let n_t = (a_n__height[n_idx] - n_min) / n_range;
                let n_r, n_g, n_b;
                if (n_t < 0.5) {
                    let n_t2 = n_t * 2;
                    n_r = 0;
                    n_g = n_t2;
                    n_b = 1 - n_t2;
                } else {
                    let n_t2 = (n_t - 0.5) * 2;
                    n_r = n_t2;
                    n_g = 1 - n_t2;
                    n_b = 0;
                }
                a_n__color[n_idx * 3] = n_r;
                a_n__color[n_idx * 3 + 1] = n_g;
                a_n__color[n_idx * 3 + 2] = n_b;
            }

            o_geometry.setAttribute('color', new THREE.BufferAttribute(a_n__color, 3));
        },

        f_n_mm__displacement: function (n_mm_width, n_factor) {
            let o_self = this;
            if (o_self.n_m_per_pixel__3d > 0 && o_self.n_scl_x__map_selection > 0) {
                let n_m__real_width = o_self.n_m_per_pixel__3d * o_self.n_scl_x__map_selection;
                let n_scale = n_m__real_width * 1000 / n_mm_width;
                let n_m__elevation_range = o_self.n_m__elevation_max - o_self.n_m__elevation_min;
                let n_mm__correct = (n_m__elevation_range * 1000 / n_scale) / 2;
                return n_mm__correct * n_factor;
            }
            return n_factor * 10 * (n_mm_width / o_self.n_mm__max_width);
        },

        f_n_mm__baseplate: function (n_mm__displacement, n_mm__min_side) {
            let n_mm__side_from_terrain = 2 * n_mm__displacement;
            let n_mm__baseplate = Math.max(10, n_mm__min_side - n_mm__side_from_terrain);
            n_mm__baseplate = Math.round(n_mm__baseplate * 2) / 2;
            return n_mm__baseplate;
        },

        f_n__nice_round: function (n_val) {
            if (n_val <= 0) return 0;
            let n_magnitude = Math.pow(10, Math.floor(Math.log10(n_val)));
            let n_leading = n_val / n_magnitude;
            let n_rounded = Math.round(n_leading * 10) / 10;
            return Math.round(n_rounded * n_magnitude);
        },

        f_s__format_number: function (n_val) {
            return n_val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        },

        f_n_m__ruler_distance: function (n_m__real_width) {
            let n_target = n_m__real_width * 0.25;
            let a_n__nice = [1, 2, 5];
            let n_magnitude = Math.pow(10, Math.floor(Math.log10(n_target)));
            let n_best = n_magnitude;
            for (let n_i = 0; n_i < a_n__nice.length; n_i++) {
                let n_candidate = a_n__nice[n_i] * n_magnitude;
                if (n_candidate <= n_target * 1.5) n_best = n_candidate;
            }
            for (let n_i = 0; n_i < a_n__nice.length; n_i++) {
                let n_candidate = a_n__nice[n_i] * n_magnitude * 10;
                if (n_candidate <= n_target * 1.5) n_best = n_candidate;
            }
            return n_best;
        },

        f_a_n__text_mask: function (n_col, n_row, n_mm_plate_x, n_mm_plate_y, s_text, n_m__real_width, n_mm__chamfer_depth) {
            n_mm__chamfer_depth = n_mm__chamfer_depth || 0;
            let el_canvas = document.createElement('canvas');
            el_canvas.width = n_col;
            el_canvas.height = n_row;
            let o_ctx = el_canvas.getContext('2d');

            let a_s__line = s_text.split('\n');
            let n_cnt__line = a_s__line.length;
            let n_font_ref = 100;
            let n_line_height_ref = n_font_ref * 1.25;
            o_ctx.font = n_font_ref + 'px sans-serif';
            let n_text_width_ref = 0;
            for (let n_i = 0; n_i < n_cnt__line; n_i++) {
                let n_w = o_ctx.measureText(a_s__line[n_i]).width;
                if (n_w > n_text_width_ref) n_text_width_ref = n_w;
            }
            let n_text_height_ref = n_cnt__line * n_line_height_ref;

            let n_px_per_mm_x = n_col / n_mm_plate_x;
            let n_px_per_mm_y = n_row / n_mm_plate_y;
            let n_px_per_mm = (n_px_per_mm_x + n_px_per_mm_y) / 2;

            let n_margin = Math.round(Math.min(n_col, n_row) * 0.04);
            let n_bar_height = Math.max(3, Math.round(n_row * 0.012));
            let n_font__ruler = Math.max(8, Math.round(n_row * 0.035));
            let n_ruler_zone_h = 0;
            let n_px__ruler = 0;
            let n_m__ruler = 0;
            let s_ruler = '';
            if (n_m__real_width > 0) {
                n_m__ruler = this.f_n_m__ruler_distance(n_m__real_width);
                let n_mm__ruler = n_m__ruler / n_m__real_width * n_mm_plate_x;
                n_px__ruler = n_mm__ruler * n_px_per_mm_x;
                if (n_m__ruler >= 1000) {
                    s_ruler = (n_m__ruler / 1000) + ' km';
                } else {
                    s_ruler = n_m__ruler + ' m';
                }
                n_ruler_zone_h = n_margin + n_font__ruler + n_bar_height * 2 + n_margin;
            }

            let n_chamfer_zone_h = n_mm__chamfer_depth * n_px_per_mm_y;

            let n_mm_plate_y__text = n_mm_plate_y - n_ruler_zone_h / n_px_per_mm_y - n_mm__chamfer_depth;
            let n_rad__diagonal_text = Math.atan2(n_mm_plate_y__text, n_mm_plate_x);
            let n_cos_t = Math.cos(n_rad__diagonal_text);
            let n_sin_t = Math.sin(n_rad__diagonal_text);
            let n_rotated_w = n_text_width_ref * n_cos_t + n_text_height_ref * n_sin_t;
            let n_rotated_h = n_text_width_ref * n_sin_t + n_text_height_ref * n_cos_t;
            let n_scl_fit = Math.min(
                n_mm_plate_x / n_rotated_w,
                n_mm_plate_y__text / n_rotated_h
            );

            let n_font_final = n_font_ref * n_scl_fit;
            let n_font_px = n_font_final * n_px_per_mm;

            let n_row__text_center = (n_ruler_zone_h + n_row - n_chamfer_zone_h) / 2;
            o_ctx.clearRect(0, 0, n_col, n_row);
            o_ctx.save();
            o_ctx.translate(n_col / 2, n_row__text_center);
            o_ctx.scale(-1, 1);
            o_ctx.rotate(-n_rad__diagonal_text);
            let n_line_height_px = n_font_px * 1.25;
            o_ctx.font = n_font_px + 'px sans-serif';
            o_ctx.fillStyle = 'white';
            o_ctx.textAlign = 'center';
            o_ctx.textBaseline = 'middle';
            let n_y__start = -(n_cnt__line - 1) * n_line_height_px / 2;
            for (let n_i = 0; n_i < n_cnt__line; n_i++) {
                o_ctx.fillText(a_s__line[n_i], 0, n_y__start + n_i * n_line_height_px);
            }
            o_ctx.restore();

            if (n_m__real_width > 0 && n_px__ruler > 0) {
                o_ctx.save();
                o_ctx.scale(-1, 1);
                let n_bar_x = -(n_col - n_margin);
                let n_bar_y = n_margin + n_font__ruler + n_bar_height;
                o_ctx.fillStyle = 'white';
                o_ctx.fillRect(n_bar_x, n_bar_y, n_px__ruler, n_bar_height);
                let n_tick_h = n_bar_height * 3;
                let n_tick_w = Math.max(2, n_bar_height * 0.6);
                o_ctx.fillRect(n_bar_x, n_bar_y - n_tick_h / 2 + n_bar_height / 2, n_tick_w, n_tick_h);
                o_ctx.fillRect(n_bar_x + n_px__ruler - n_tick_w, n_bar_y - n_tick_h / 2 + n_bar_height / 2, n_tick_w, n_tick_h);
                o_ctx.font = n_font__ruler + 'px sans-serif';
                o_ctx.textAlign = 'left';
                o_ctx.textBaseline = 'bottom';
                o_ctx.fillText(s_ruler, n_bar_x, n_bar_y - n_bar_height * 0.5);
                o_ctx.restore();
            }

            let o_imagedata = o_ctx.getImageData(0, 0, n_col, n_row);
            let a_n__rgba = o_imagedata.data;
            let a_n__mask = new Uint8Array(n_col * n_row);
            for (let n_idx = 0; n_idx < a_n__mask.length; n_idx++) {
                a_n__mask[n_idx] = a_n__rgba[n_idx * 4 + 3] > 127 ? 255 : 0;
            }
            return a_n__mask;
        },

        // ===================== STL EXPORT =====================

        f_o_buffer__stl_from_o_group: function (o_group) {
            let o_self = this;
            let THREE = o_self._THREE;

            let a_o_geometry = [];
            o_group.traverse(function (o_child) {
                if (o_child.isMesh) {
                    let o_geom = o_child.geometry.clone();
                    o_geom.applyMatrix4(o_child.matrixWorld);
                    if (o_geom.index) {
                        o_geom = o_geom.toNonIndexed();
                    }
                    a_o_geometry.push(o_geom);
                }
            });

            let n_cnt__triangle = 0;
            for (let o_geom of a_o_geometry) {
                n_cnt__triangle += o_geom.attributes.position.count / 3;
            }

            let n_len = 80 + 4 + n_cnt__triangle * 50;
            let o_buffer = new ArrayBuffer(n_len);
            let o_view = new DataView(o_buffer);

            let n_off = 80;
            o_view.setUint32(n_off, n_cnt__triangle, true);
            n_off += 4;

            let o_va = new THREE.Vector3();
            let o_vb = new THREE.Vector3();
            let o_vc = new THREE.Vector3();
            let o_cb = new THREE.Vector3();
            let o_ab = new THREE.Vector3();

            for (let o_geom of a_o_geometry) {
                let o_pos = o_geom.attributes.position;
                for (let n_idx = 0; n_idx < o_pos.count; n_idx += 3) {
                    o_va.fromBufferAttribute(o_pos, n_idx);
                    o_vb.fromBufferAttribute(o_pos, n_idx + 1);
                    o_vc.fromBufferAttribute(o_pos, n_idx + 2);

                    o_cb.subVectors(o_vc, o_vb);
                    o_ab.subVectors(o_va, o_vb);
                    o_cb.cross(o_ab).normalize();

                    o_view.setFloat32(n_off, o_cb.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_cb.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_cb.z, true); n_off += 4;
                    o_view.setFloat32(n_off, o_va.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_va.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_va.z, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vb.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vb.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vb.z, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vc.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vc.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vc.z, true); n_off += 4;
                    o_view.setUint16(n_off, 0, true); n_off += 2;
                }
                o_geom.dispose();
            }

            return o_buffer;
        },

        f_download_buffer: function (o_buffer, s_filename) {
            let o_blob = new Blob([o_buffer], { type: 'application/octet-stream' });
            let s_url = URL.createObjectURL(o_blob);
            let el_a = document.createElement('a');
            el_a.href = s_url;
            el_a.download = s_filename;
            el_a.click();
            URL.revokeObjectURL(s_url);
        },

        f_o_group__build_variant: function (n_mm_width, b_with_hole, n_ve_override, n_mm__baseplate_override, n_pxmm) {
            let o_self = this;
            let THREE = o_self._THREE;
            let n_factor = (n_ve_override != null) ? n_ve_override : o_self.n_factor;

            n_pxmm = n_pxmm || 10;
            let n_max_px = Math.round(n_mm_width * n_pxmm);
            let n_src_x = o_self.n_scl_x__image;
            let n_src_y = o_self.n_scl_y__image;
            let n_scl_x = n_src_x;
            let n_scl_y = n_src_y;
            let a_n__data = o_self.a_n__image_data;

            if (n_scl_x > n_max_px || n_scl_y > n_max_px) {
                let n_ds = Math.min(n_max_px / n_scl_x, n_max_px / n_scl_y);
                n_scl_x = Math.max(2, Math.floor(n_scl_x * n_ds));
                n_scl_y = Math.max(2, Math.floor(n_scl_y * n_ds));

                let el_src = document.createElement('canvas');
                el_src.width = n_src_x;
                el_src.height = n_src_y;
                let o_ctx_src = el_src.getContext('2d');
                let o_img = o_ctx_src.createImageData(n_src_x, n_src_y);
                for (let n_i = 0; n_i < o_self.a_n__image_data.length; n_i++) {
                    let n_v = o_self.a_n__image_data[n_i];
                    o_img.data[n_i * 4] = n_v;
                    o_img.data[n_i * 4 + 1] = n_v;
                    o_img.data[n_i * 4 + 2] = n_v;
                    o_img.data[n_i * 4 + 3] = 255;
                }
                o_ctx_src.putImageData(o_img, 0, 0);
                let el_dst = document.createElement('canvas');
                el_dst.width = n_scl_x;
                el_dst.height = n_scl_y;
                let o_ctx_dst = el_dst.getContext('2d');
                o_ctx_dst.drawImage(el_src, 0, 0, n_scl_x, n_scl_y);
                let o_img_dst = o_ctx_dst.getImageData(0, 0, n_scl_x, n_scl_y);
                a_n__data = new Uint8Array(n_scl_x * n_scl_y);
                for (let n_i = 0; n_i < a_n__data.length; n_i++) {
                    a_n__data[n_i] = o_img_dst.data[n_i * 4];
                }
            }

            let n_ratio = n_scl_x / n_scl_y;
            let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
            let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
            let o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);

            o_geometry.computeBoundingBox();
            let o_box = o_geometry.boundingBox;
            let n_max_dim = Math.max(
                o_box.max.x - o_box.min.x,
                o_box.max.y - o_box.min.y,
                o_box.max.z - o_box.min.z
            );
            let n_scl = n_mm_width / n_max_dim;
            o_geometry.scale(n_scl, n_scl, n_scl);

            let n_mm__displacement = o_self.f_n_mm__displacement(n_mm_width, n_factor);
            o_self.f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_mm__displacement, 'plane');

            let n_mm__baseplate;
            if (n_mm__baseplate_override != null) {
                n_mm__baseplate = n_mm__baseplate_override;
            } else {
                n_mm__baseplate = o_self.f_n_mm__baseplate(n_mm__displacement, o_self.n_mm__min_side);
            }

            // use effective chamfer (0 if disabled)
            let n_deg__chamfer_variant = o_self.b_chamfer__enabled ? 45 : 0;

            let n_mm__chamfer_depth_variant = n_deg__chamfer_variant > 0 ? (n_mm__baseplate + n_mm__displacement) / Math.tan(n_deg__chamfer_variant * Math.PI / 180) : 0;

            let a_n__text_mask = null;
            if (o_self.b_text__enabled && o_self.s_text__carve.length > 0 && o_self.n_m_per_pixel__3d > 0) {
                let n_mm_plate_x = n_ratio >= 1 ? n_mm_width : n_mm_width * n_ratio;
                let n_mm_plate_y = n_ratio >= 1 ? n_mm_width / n_ratio : n_mm_width;
                let n_m__real_width = o_self.n_m_per_pixel__3d * o_self.n_scl_x__map_selection;
                let n_scale = n_m__real_width * 1000 / n_mm_width;
                let n_scale__nice = o_self.f_n__nice_round(n_scale);
                let a_s__line = ['TopoPrints'];
                if (o_self.s_name__location) a_s__line.push(o_self.s_name__location);
                a_s__line.push('1:' + o_self.f_s__format_number(n_scale__nice));
                a_s__line.push('VE: ' + n_factor.toFixed(1));
                let s_text = a_s__line.join('\n');
                a_n__text_mask = o_self.f_a_n__text_mask(n_scl_x, n_scl_y, n_mm_plate_x, n_mm_plate_y, s_text, n_m__real_width, n_mm__chamfer_depth_variant);
            } else if (o_self.b_text__enabled && o_self.s_text__carve.length > 0) {
                let n_mm_plate_x = n_ratio >= 1 ? n_mm_width : n_mm_width * n_ratio;
                let n_mm_plate_y = n_ratio >= 1 ? n_mm_width / n_ratio : n_mm_width;
                a_n__text_mask = o_self.f_a_n__text_mask(n_scl_x, n_scl_y, n_mm_plate_x, n_mm_plate_y, o_self.s_text__carve, 0, n_mm__chamfer_depth_variant);
            }

            let o_hole = null;
            if (b_with_hole) {
                o_geometry.computeBoundingBox();
                let o_bb = o_geometry.boundingBox;
                let n_hole_radius = o_self.n_mm__hole_diameter / 2;
                let n_hole_margin = o_self.n_mm__hole_margin;
                let n_hole_cx, n_hole_cy;
                let s_corner = o_self.s_corner__hole;
                if (s_corner === 'tl') {
                    n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
                    n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
                } else if (s_corner === 'tr') {
                    n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
                    n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
                } else if (s_corner === 'bl') {
                    n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
                    n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
                } else {
                    n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
                    n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
                }
                o_hole = { n_cx: n_hole_cx, n_cy: n_hole_cy, n_radius: n_hole_radius };
            }

            let o_geom__solid = o_self.f_o_geometry__solid_plane(
                o_geometry, n_mm__baseplate, n_deg__chamfer_variant,
                a_n__text_mask, o_self.n_mm__text_depth, o_hole
            );

            o_geom__solid.computeVertexNormals();

            let o_group = new THREE.Group();
            let o_mesh = new THREE.Mesh(o_geom__solid, new THREE.MeshBasicMaterial());
            o_group.add(o_mesh);
            o_geometry.dispose();

            return o_group;
        },

        f_dispose_variant_preview: function () {
            let o_self = this;
            let a_s_key = ['_o_group__large_ve1', '_o_group__large_ve2', '_o_group__medium_ve1', '_o_group__medium_ve2', '_o_group__keychain_ve1', '_o_group__keychain_ve2'];
            for (let n_i = 0; n_i < a_s_key.length; n_i++) {
                let o_group = o_self[a_s_key[n_i]];
                if (o_group) {
                    o_self._o_scene.remove(o_group);
                    o_group.traverse(function (o_child) {
                        if (o_child.geometry) o_child.geometry.dispose();
                        if (o_child.material) o_child.material.dispose();
                    });
                    o_self[a_s_key[n_i]] = null;
                }
            }
            if (o_self._o_group) {
                o_self._o_scene.remove(o_self._o_group);
                o_self._o_group.traverse(function (o_child) {
                    if (o_child.geometry) o_child.geometry.dispose();
                    if (o_child.material) o_child.material.dispose();
                });
                o_self._o_group = null;
                o_self._o_mesh = null;
            }
            o_self.b_variant__generated = false;
        },

        f_toggle_variant_preview: function (n_idx) {
            let o_self = this;
            let a_s_key = ['_o_group__large_ve1', '_o_group__large_ve2', '_o_group__medium_ve1', '_o_group__medium_ve2', '_o_group__keychain_ve1', '_o_group__keychain_ve2'];
            let a_s_flag = ['b_show__large_ve1', 'b_show__large_ve2', 'b_show__medium_ve1', 'b_show__medium_ve2', 'b_show__keychain_ve1', 'b_show__keychain_ve2'];

            o_self[a_s_flag[n_idx]] = !o_self[a_s_flag[n_idx]];
            let o_group = o_self[a_s_key[n_idx]];
            if (o_group) {
                o_group.visible = o_self[a_s_flag[n_idx]];
            }
        },

        f_download_stl_all: async function () {
            let o_self = this;
            if (!o_self.a_n__image_data || !o_self._THREE) return;

            let THREE = o_self._THREE;
            let s_name = o_self.s_name__location || 'topo';
            s_name = s_name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

            let a_o_variant = [
                { n_mm_width: 220, s_suffix: 'large_220mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null, n_pxmm: null, s_key: '_o_group__large_ve1', s_flag: 'b_show__large_ve1' },
                { n_mm_width: 220, s_suffix: 'large_220mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null, n_pxmm: null, s_key: '_o_group__large_ve2', s_flag: 'b_show__large_ve2' },
                { n_mm_width: 160, s_suffix: 'medium_160mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null, n_pxmm: null, s_key: '_o_group__medium_ve1', s_flag: 'b_show__medium_ve1' },
                { n_mm_width: 160, s_suffix: 'medium_160mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null, n_pxmm: null, s_key: '_o_group__medium_ve2', s_flag: 'b_show__medium_ve2' },
                { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve1', b_hole: o_self.b_hole__enabled, n_ve: 1.0, n_mm__baseplate: 2, n_pxmm: null, s_key: '_o_group__keychain_ve1', s_flag: 'b_show__keychain_ve1' },
                { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve2', b_hole: o_self.b_hole__enabled, n_ve: 2.0, n_mm__baseplate: 2, n_pxmm: null, s_key: '_o_group__keychain_ve2', s_flag: 'b_show__keychain_ve2' },
            ];

            o_self.f_dispose_variant_preview();

            for (let n_i = 0; n_i < a_o_variant.length; n_i++) {
                let o_variant = a_o_variant[n_i];
                let o_group = o_self.f_o_group__build_variant(o_variant.n_mm_width, o_variant.b_hole, o_variant.n_ve, o_variant.n_mm__baseplate, o_variant.n_pxmm);
                let o_buffer = o_self.f_o_buffer__stl_from_o_group(o_group);

                let o_mesh = o_group.children[0];
                if (o_self.b_colormap__height) {
                    o_self.f_apply_vertex_color(o_mesh.geometry, 'plane');
                }
                o_mesh.geometry.computeVertexNormals();
                o_mesh.material.dispose();
                o_mesh.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(o_self.s_color__mesh),
                    wireframe: o_self.b_wireframe,
                    side: THREE.DoubleSide,
                    flatShading: true,
                    vertexColors: o_self.b_colormap__height,
                });

                o_self._o_scene.add(o_group);
                o_self[o_variant.s_key] = o_group;

                o_self.f_download_buffer(o_buffer, s_name + '_' + o_variant.s_suffix + '.stl');

                if (n_i < a_o_variant.length - 1) {
                    await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });
                }
            }

            for (let n_i = 0; n_i < a_o_variant.length; n_i++) {
                let b_visible = n_i === 0;
                o_self[a_o_variant[n_i].s_flag] = b_visible;
                if (o_self[a_o_variant[n_i].s_key]) o_self[a_o_variant[n_i].s_key].visible = b_visible;
            }

            o_self.b_variant__generated = true;
            o_self.b_preview = true;
        },

        // ===================== OPENSCAD EXPORT =====================

        f_s__openscad_script: function (n_mm_width, s_heightmap_file, b_with_hole, n_ve_override, n_mm__baseplate_override) {
            let o_self = this;
            let n_factor = (n_ve_override != null) ? n_ve_override : o_self.n_factor;
            let n_scl_x = o_self.n_scl_x__image;
            let n_scl_y = o_self.n_scl_y__image;
            let n_ratio = n_scl_x / n_scl_y;
            let n_mm_plate_x = n_ratio >= 1 ? n_mm_width : n_mm_width * n_ratio;
            let n_mm_plate_y = n_ratio >= 1 ? n_mm_width / n_ratio : n_mm_width;

            let n_mm__displacement = 0;
            let n_scale = 0;
            if (o_self.n_m_per_pixel__3d > 0 && o_self.n_scl_x__map_selection > 0) {
                let n_m__real_width = o_self.n_m_per_pixel__3d * o_self.n_scl_x__map_selection;
                n_scale = n_m__real_width * 1000 / n_mm_width;
                let n_m__elevation_range = o_self.n_m__elevation_max - o_self.n_m__elevation_min;
                n_mm__displacement = (n_m__elevation_range * 1000 / n_scale) * n_factor;
            } else {
                n_mm__displacement = n_factor * 10 * (n_mm_width / o_self.n_mm__max_width);
            }

            let n_mm__baseplate;
            if (n_mm__baseplate_override != null) {
                n_mm__baseplate = n_mm__baseplate_override;
            } else {
                n_mm__baseplate = o_self.f_n_mm__baseplate(n_mm__displacement, o_self.n_mm__min_side);
            }

            let n_scl_z = n_mm__displacement / 100;
            let n_scl_factor_x = n_mm_plate_x / n_scl_x;
            let n_scl_factor_y = n_mm_plate_y / n_scl_y;

            let n_outer_r = o_self.n_mm__hole_diameter / 2 + 1.5;
            let n_inner_r = o_self.n_mm__hole_diameter / 2;
            let n_hole_margin = o_self.n_mm__hole_margin;

            let n_hole_cx = 0;
            let n_hole_cy = 0;
            let s_corner = o_self.s_corner__hole;
            if (s_corner === 'tl') {
                n_hole_cx = -n_mm_plate_x / 2 + n_hole_margin + n_outer_r;
                n_hole_cy = n_mm_plate_y / 2 - n_hole_margin - n_outer_r;
            } else if (s_corner === 'tr') {
                n_hole_cx = n_mm_plate_x / 2 - n_hole_margin - n_outer_r;
                n_hole_cy = n_mm_plate_y / 2 - n_hole_margin - n_outer_r;
            } else if (s_corner === 'bl') {
                n_hole_cx = -n_mm_plate_x / 2 + n_hole_margin + n_outer_r;
                n_hole_cy = -n_mm_plate_y / 2 + n_hole_margin + n_outer_r;
            } else {
                n_hole_cx = n_mm_plate_x / 2 - n_hole_margin - n_outer_r;
                n_hole_cy = -n_mm_plate_y / 2 + n_hole_margin + n_outer_r;
            }

            let n_scale__nice = n_scale > 0 ? o_self.f_n__nice_round(n_scale) : 0;
            let s_scale_text = n_scale__nice > 0 ? '1:' + o_self.f_s__format_number(n_scale__nice) : '';
            let s_location = o_self.s_name__location || '';
            let n_total_height = n_mm__baseplate + n_mm__displacement;

            let a_s__carve = ['TopoPrints'];
            if (s_location) a_s__carve.push(s_location);
            if (s_scale_text) a_s__carve.push(s_scale_text);
            a_s__carve.push('VE: ' + n_factor.toFixed(1));

            let n_deg__chamfer_scad = o_self.b_chamfer__enabled ? 45 : 0;

            let s = '';
            s += '// TopoPrints — OpenSCAD model\n';
            s += '// ' + (s_location || 'Custom heightmap') + '\n';
            s += '// Width: ' + n_mm_width + 'mm, Scale: ' + (s_scale_text || 'N/A') + ', VE: ' + n_factor.toFixed(1) + '\n';
            s += '// Place this file in the same folder as the heightmap PNG\n\n';

            s += '$fn = 64;\n\n';

            s += '// --- Parameters ---\n';
            s += 'n_mm_plate_x = ' + n_mm_plate_x.toFixed(2) + ';\n';
            s += 'n_mm_plate_y = ' + n_mm_plate_y.toFixed(2) + ';\n';
            s += 'n_mm_baseplate = ' + n_mm__baseplate.toFixed(1) + ';\n';
            s += 'n_mm_displacement = ' + n_mm__displacement.toFixed(3) + ';\n';
            s += 'n_scl_x = ' + n_scl_factor_x.toFixed(6) + ';\n';
            s += 'n_scl_y = ' + n_scl_factor_y.toFixed(6) + ';\n';
            s += 'n_scl_z = ' + n_scl_z.toFixed(6) + ';\n';
            s += 'n_total_height = ' + n_total_height.toFixed(2) + ';\n';
            s += 's_heightmap = "' + s_heightmap_file + '";\n\n';

            if (n_deg__chamfer_scad > 0) {
                s += '// --- Chamfer (' + n_deg__chamfer_scad + ' deg cut on front edge for print bed) ---\n';
                s += 'n_deg_chamfer = ' + n_deg__chamfer_scad + ';\n\n';
            }

            if (o_self.b_text__enabled) {
                s += '// --- Text carving ---\n';
                s += 'n_mm_text_depth = ' + o_self.n_mm__text_depth.toFixed(2) + ';\n';
                s += 'a_s_text = ' + JSON.stringify(a_s__carve) + ';\n';
                s += 's_carve_text = str(a_s_text[0]';
                for (let n_i = 1; n_i < a_s__carve.length; n_i++) {
                    s += ', "\\n", a_s_text[' + n_i + ']';
                }
                s += ');\n\n';
            }

            if (b_with_hole) {
                s += '// --- Corner hole ---\n';
                s += 'n_outer_r = ' + n_outer_r.toFixed(2) + ';\n';
                s += 'n_inner_r = ' + n_inner_r.toFixed(2) + ';\n';
                s += 'n_hole_cx = ' + n_hole_cx.toFixed(2) + ';\n';
                s += 'n_hole_cy = ' + n_hole_cy.toFixed(2) + ';\n\n';
            }

            s += '// --- Modules ---\n\n';

            s += 'module topo_surface() {\n';
            s += '    translate([-n_mm_plate_x/2, -n_mm_plate_y/2, 0])\n';
            s += '    scale([n_scl_x, n_scl_y, n_scl_z])\n';
            s += '    surface(file=s_heightmap, center=false, convexity=5);\n';
            s += '}\n\n';

            s += 'module baseplate() {\n';
            s += '    translate([0, 0, -n_mm_baseplate/2])\n';
            s += '    cube([n_mm_plate_x, n_mm_plate_y, n_mm_baseplate], center=true);\n';
            s += '}\n\n';

            s += 'module solid_model() {\n';
            s += '    union() {\n';
            s += '        topo_surface();\n';
            s += '        baseplate();\n';
            s += '    }\n';
            s += '}\n\n';

            if (n_deg__chamfer_scad > 0) {
                s += 'module chamfered_model() {\n';
                s += '    intersection() {\n';
                s += '        solid_model();\n';
                s += '        translate([0, -n_mm_plate_y/2, -n_mm_baseplate])\n';
                s += '        rotate([n_deg_chamfer, 0, 0])\n';
                s += '        translate([0, 0, -200])\n';
                s += '        cube([n_mm_plate_x + 2, 400, 400], center=true);\n';
                s += '    }\n';
                s += '}\n\n';
            }

            if (o_self.b_text__enabled) {
                s += 'module text_carve() {\n';
                s += '    n_diag_angle = atan2(n_mm_plate_y, n_mm_plate_x);\n';
                s += '    translate([0, 0, -n_mm_baseplate])\n';
                s += '    mirror([1, 0, 0])\n';
                s += '    rotate([0, 0, -n_diag_angle])\n';
                s += '    linear_extrude(height=n_mm_text_depth)\n';
                s += '    text(s_carve_text, size=n_mm_plate_x * 0.08, halign="center", valign="center", font="sans-serif");\n';
                s += '}\n\n';
            }

            if (b_with_hole) {
                s += 'module hole_ring() {\n';
                s += '    translate([n_hole_cx, n_hole_cy, -n_mm_baseplate - 0.01])\n';
                s += '    difference() {\n';
                s += '        cylinder(h=n_total_height + 0.02, r=n_outer_r);\n';
                s += '        translate([0, 0, -0.1])\n';
                s += '        cylinder(h=n_total_height + 0.24, r=n_inner_r);\n';
                s += '    }\n';
                s += '}\n\n';
            }

            s += '// --- Assembly ---\n';
            let s_base_model = n_deg__chamfer_scad > 0 ? 'chamfered_model()' : 'solid_model()';
            if (b_with_hole) {
                s += 'difference() {\n';
                s += '    union() {\n';
                s += '        ' + s_base_model + ';\n';
                s += '        hole_ring();\n';
                s += '    }\n';
                if (o_self.b_text__enabled) {
                    s += '    text_carve();\n';
                }
                s += '}\n';
            } else if (o_self.b_text__enabled) {
                s += 'difference() {\n';
                s += '    ' + s_base_model + ';\n';
                s += '    text_carve();\n';
                s += '}\n';
            } else {
                s += s_base_model + ';\n';
            }

            return s;
        },

        f_download_openscad: async function () {
            let o_self = this;
            if (!o_self.a_n__image_data) return;

            let s_name = o_self.s_name__location || 'topo';
            s_name = s_name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            let s_heightmap_file = s_name + '_heightmap.png';

            if (o_self.s_data_url__heightmap) {
                let o_a = document.createElement('a');
                o_a.download = s_heightmap_file;
                o_a.href = o_self.s_data_url__heightmap;
                o_a.click();
            }

            await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });

            let a_o_variant = [
                { n_mm_width: 220, s_suffix: 'large_220mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null },
                { n_mm_width: 220, s_suffix: 'large_220mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null },
                { n_mm_width: 160, s_suffix: 'medium_160mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null },
                { n_mm_width: 160, s_suffix: 'medium_160mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null },
                { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve1', b_hole: o_self.b_hole__enabled, n_ve: 1.0, n_mm__baseplate: 1.5 },
                { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve2', b_hole: o_self.b_hole__enabled, n_ve: 2.0, n_mm__baseplate: 1.5 },
            ];

            for (let n_i = 0; n_i < a_o_variant.length; n_i++) {
                let o_variant = a_o_variant[n_i];
                let s_script = o_self.f_s__openscad_script(
                    o_variant.n_mm_width, s_heightmap_file, o_variant.b_hole, o_variant.n_ve, o_variant.n_mm__baseplate
                );

                let o_blob = new Blob([s_script], { type: 'text/plain' });
                let s_url = URL.createObjectURL(o_blob);
                let o_a = document.createElement('a');
                o_a.href = s_url;
                o_a.download = s_name + '_' + o_variant.s_suffix + '.scad';
                o_a.click();
                URL.revokeObjectURL(s_url);

                await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });
            }
        },

        f_generate_and_download: async function () {
            let o_self = this;

            // always run export to capture the current map view
            await o_self.f_export();
            if (!o_self.a_n__image_data) return;

            // download 6 STL files + preview
            await o_self.f_download_stl_all();

            await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });

            // download heightmap PNG + 6 OpenSCAD scripts
            await o_self.f_download_openscad();
        },

        // ===================== TILING =====================

        f_a_n__extract_region: function (n_x, n_y, n_scl_x, n_scl_y) {
            let o_self = this;
            let o_ctx = o_self._el_canvas__grayscale.getContext('2d');
            let o_imagedata = o_ctx.getImageData(n_x, n_y, n_scl_x, n_scl_y);
            let a_n__rgba = o_imagedata.data;

            let n_out_x = n_scl_x;
            let n_out_y = n_scl_y;
            let n_max = o_self.n_max_resolution;

            if (n_out_x > n_max || n_out_y > n_max) {
                let n_ratio = Math.min(n_max / n_out_x, n_max / n_out_y);
                n_out_x = Math.floor(n_out_x * n_ratio);
                n_out_y = Math.floor(n_out_y * n_ratio);
            }

            let a_n__gray;
            if (n_out_x !== n_scl_x || n_out_y !== n_scl_y) {
                let el_tmp = document.createElement('canvas');
                el_tmp.width = n_scl_x;
                el_tmp.height = n_scl_y;
                el_tmp.getContext('2d').putImageData(o_imagedata, 0, 0);
                let el_tmp2 = document.createElement('canvas');
                el_tmp2.width = n_out_x;
                el_tmp2.height = n_out_y;
                el_tmp2.getContext('2d').drawImage(el_tmp, 0, 0, n_out_x, n_out_y);
                let o_data2 = el_tmp2.getContext('2d').getImageData(0, 0, n_out_x, n_out_y);
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = o_data2.data[n_idx * 4];
                }
            } else {
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = a_n__rgba[n_idx * 4];
                }
            }

            return { a_n__gray, n_scl_x: n_out_x, n_scl_y: n_out_y };
        },

        f_o_group__from_data: function (a_n__data, n_scl_x, n_scl_y) {
            let o_self = this;
            let THREE = o_self._THREE;
            let s_type = o_self.s_type__geometry;
            let n_factor = o_self.n_factor;

            let o_geometry = null;
            if (s_type === 'sphere') {
                o_geometry = new THREE.SphereGeometry(1, n_scl_x - 1, n_scl_y - 1);
            } else if (s_type === 'cylinder') {
                o_geometry = new THREE.CylinderGeometry(1, 1, 2, n_scl_x - 1, n_scl_y - 1, true);
            } else if (s_type === 'plane') {
                let n_ratio = n_scl_x / n_scl_y;
                let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
                let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
                o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);
            }

            o_geometry.computeBoundingBox();
            let o_box = o_geometry.boundingBox;
            let n_max_dim = Math.max(
                o_box.max.x - o_box.min.x,
                o_box.max.y - o_box.min.y,
                o_box.max.z - o_box.min.z
            );
            let n_scl = o_self.n_mm__max_width / n_max_dim;
            o_geometry.scale(n_scl, n_scl, n_scl);

            let n_mm__displacement = o_self.f_n_mm__displacement(o_self.n_mm__max_width, n_factor);
            o_self.f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_mm__displacement, s_type);

            let o_group = new THREE.Group();

            if (s_type === 'plane' && o_self.n_mm__baseplate > 0) {
                let o_geom__solid = o_self.f_o_geometry__solid_plane(o_geometry, o_self.n_mm__baseplate, o_self.n_deg__chamfer_effective);
                o_geom__solid.computeVertexNormals();
                let o_mesh = new THREE.Mesh(o_geom__solid, new THREE.MeshBasicMaterial());
                o_group.add(o_mesh);
                o_geometry.dispose();
            } else {
                o_geometry.computeVertexNormals();
                let o_mesh = new THREE.Mesh(o_geometry, new THREE.MeshBasicMaterial());
                o_group.add(o_mesh);
            }

            return o_group;
        },

        f_start_tiling: async function () {
            let o_self = this;
            if (!o_self._el_canvas__grayscale || !o_self._THREE || o_self.b_tiling__running) return;

            o_self.b_tiling__running = true;
            let n_col = o_self.n_tile_col;
            let n_row = o_self.n_tile_row;

            let n_sel_x = 0;
            let n_sel_y = 0;
            let n_sel_w = o_self.n_scl_x__full;
            let n_sel_h = o_self.n_scl_y__full;

            let n_tile_w = Math.floor(n_sel_w / n_col);
            let n_tile_h = Math.floor(n_sel_h / n_row);
            let n_total = n_col * n_row;
            let n_done = 0;

            for (let n_r = 0; n_r < n_row; n_r++) {
                for (let n_c = 0; n_c < n_col; n_c++) {
                    let n_x = n_sel_x + n_c * n_tile_w;
                    let n_y = n_sel_y + n_r * n_tile_h;
                    let n_w = (n_c === n_col - 1) ? (n_sel_x + n_sel_w - n_x) : n_tile_w;
                    let n_h = (n_r === n_row - 1) ? (n_sel_y + n_sel_h - n_y) : n_tile_h;

                    n_done++;
                    o_self.s_tiling__status = 'Tile ' + n_done + '/' + n_total + ' (r' + (n_r + 1) + '_c' + (n_c + 1) + ')';

                    await new Promise(function (f_resolve) { setTimeout(f_resolve, 100); });

                    let o_region = o_self.f_a_n__extract_region(n_x, n_y, n_w, n_h);
                    let o_group = o_self.f_o_group__from_data(o_region.a_n__gray, o_region.n_scl_x, o_region.n_scl_y);
                    let o_buffer = o_self.f_o_buffer__stl_from_o_group(o_group);

                    o_group.traverse(function (o_child) {
                        if (o_child.geometry) o_child.geometry.dispose();
                        if (o_child.material) o_child.material.dispose();
                    });

                    let s_filename = 'tile_r' + (n_r + 1) + '_c' + (n_c + 1) + '.stl';
                    o_self.f_download_buffer(o_buffer, s_filename);

                    await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });
                }
            }

            o_self.s_tiling__status = 'Done — ' + n_total + ' tile(s) exported';
            o_self.b_tiling__running = false;
        },

        // ===================== SCENE CONTROLS =====================

        f_set_color_bg: function (s_color) {
            this.s_color__bg = s_color;
            if (this._o_scene && this._THREE) {
                this._o_scene.background = new this._THREE.Color(s_color);
            }
        },
        f_set_color_mesh: function (s_color) {
            this.s_color__mesh = s_color;
            if (this._o_mesh) {
                this._o_mesh.material.color.set(s_color);
            }
        },
        f_set_wireframe: function () {
            if (this._o_mesh) {
                this._o_mesh.material.wireframe = this.b_wireframe;
            }
        },
        f_set_ambient: function () {
            if (this._o_light__ambient) {
                this._o_light__ambient.intensity = this.n_intensity__ambient;
            }
        },
        f_set_directional: function () {
            if (this._o_light__directional) {
                this._o_light__directional.intensity = this.n_intensity__directional;
            }
        },
        f_set_autorotate: function () {
            if (this._o_control) {
                this._o_control.autoRotate = this.b_autorotate;
            }
        },
        f_set_rotation_speed: function () {
            if (this._o_control) {
                this._o_control.autoRotateSpeed = this.n_speed__rotation;
            }
        },

        // ===================== MINIMAP 3D PREVIEW =====================

        f_init_minimap: async function () {
            let o_self = this;
            let THREE = o_self._THREE;
            if (!THREE) return;

            let el_canvas = o_self.$refs.canvas__minimap;
            if (!el_canvas) return;

            let { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

            let n_sz = 200;
            let o_renderer = new THREE.WebGLRenderer({ canvas: el_canvas, antialias: true, alpha: true });
            o_renderer.setPixelRatio(window.devicePixelRatio);
            o_renderer.setSize(n_sz, n_sz);

            let o_scene = new THREE.Scene();
            o_scene.background = new THREE.Color('#0a0a12');

            // isometric-style orthographic camera
            let n_frustum = 1.6;
            let o_camera = new THREE.OrthographicCamera(-n_frustum, n_frustum, n_frustum, -n_frustum, 0.1, 100);
            o_camera.position.set(3, 2.5, 3);
            o_camera.lookAt(0, 0, 0);

            // orbit controls for rotating/zooming the minimap
            let o_control = new OrbitControls(o_camera, o_renderer.domElement);
            o_control.enableDamping = true;
            o_control.dampingFactor = 0.1;
            o_control.enablePan = false;
            o_control.minZoom = 0.5;
            o_control.maxZoom = 3;

            let o_light__ambient = new THREE.AmbientLight(0xffffff, 1.0);
            o_scene.add(o_light__ambient);
            let o_light__dir = new THREE.DirectionalLight(0xffffff, 1.5);
            o_light__dir.position.set(3, 4, 2);
            o_scene.add(o_light__dir);

            o_self._o_renderer__minimap = o_renderer;
            o_self._o_scene__minimap = o_scene;
            o_self._o_camera__minimap = o_camera;
            o_self._o_control__minimap = o_control;

            let f_animate = function () {
                o_self._n_id__animation__minimap = requestAnimationFrame(f_animate);
                o_control.update();
                o_renderer.render(o_scene, o_camera);
            };
            f_animate();
        },

        f_debounce_minimap_update: function () {
            let o_self = this;
            if (o_self._n_id__debounce__minimap) clearTimeout(o_self._n_id__debounce__minimap);
            o_self._n_id__debounce__minimap = setTimeout(function () {
                o_self.f_update_minimap();
            }, 600);
        },

        f_update_minimap: async function () {
            let o_self = this;
            if (!o_self.o_config || !o_self._o_map) return;
            if (!o_self._THREE) {
                o_self._THREE = await import('three');
            }
            if (!o_self._o_renderer__minimap) {
                await o_self.f_init_minimap();
                if (!o_self._o_renderer__minimap) return;
            }

            let THREE = o_self._THREE;
            o_self.b_minimap__loading = true;

            let n_resolution__saved = o_self.n_resolution;
            try {
                // temporarily override resolution for Switzerland to use coarse grid
                let n_coarse = 64;
                o_self.n_resolution = n_coarse;

                let o_result = await o_self.o_config.f_s_data_url__from_elevation(o_self);

                // decode heightmap into grayscale array
                let o_image = new Image();
                let o_data = await new Promise(function (f_resolve) {
                    o_image.onload = function () {
                        let n_w = o_image.width;
                        let n_h = o_image.height;
                        let el_c = document.createElement('canvas');
                        el_c.width = n_w;
                        el_c.height = n_h;
                        let o_ctx = el_c.getContext('2d');
                        o_ctx.drawImage(o_image, 0, 0);
                        let o_img_data = o_ctx.getImageData(0, 0, n_w, n_h);
                        let a_n = new Uint8Array(n_w * n_h);
                        for (let n_i = 0; n_i < a_n.length; n_i++) {
                            a_n[n_i] = o_img_data.data[n_i * 4];
                        }
                        f_resolve({ a_n, n_w, n_h });
                    };
                    o_image.src = o_result.s_data_url;
                });

                // build mesh
                let n_scl_x = o_data.n_w;
                let n_scl_y = o_data.n_h;
                let n_ratio = n_scl_x / n_scl_y;
                let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
                let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
                let o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);

                // displace Z by elevation at true scale (VE 1.0)
                // plane is n_plane_x units wide representing real-world width
                let n_m__real_width = o_result.n_m_per_pixel * o_result.n_scl_x__selection;
                let n_m__elevation_range = o_result.n_m__elevation_max - o_result.n_m__elevation_min;
                // displacement in plane units: elevation range / real width * plane width
                let n_displacement = (n_m__real_width > 0 && n_m__elevation_range > 0)
                    ? (n_m__elevation_range / n_m__real_width) * n_plane_x
                    : 0.1;

                let o_pos = o_geometry.attributes.position;
                for (let n_idx = 0; n_idx < o_pos.count; n_idx++) {
                    let n_row = Math.floor(n_idx / n_scl_x);
                    let n_col = n_idx % n_scl_x;
                    n_row = Math.min(n_row, n_scl_y - 1);
                    n_col = Math.min(n_col, n_scl_x - 1);
                    let n_val = o_data.a_n[n_row * n_scl_x + n_col];
                    o_pos.setZ(n_idx, (n_val / 255) * n_displacement);
                }
                o_pos.needsUpdate = true;
                o_geometry.computeVertexNormals();

                // vertex coloring (blue → green → red)
                let a_n__color = new Float32Array(o_pos.count * 3);
                for (let n_idx = 0; n_idx < o_pos.count; n_idx++) {
                    let n_t = (o_data.a_n[Math.min(n_idx, o_data.a_n.length - 1)]) / 255;
                    let n_r, n_g, n_b;
                    if (n_t < 0.5) {
                        let n_t2 = n_t * 2;
                        n_r = 0; n_g = n_t2; n_b = 1 - n_t2;
                    } else {
                        let n_t2 = (n_t - 0.5) * 2;
                        n_r = n_t2; n_g = 1 - n_t2; n_b = 0;
                    }
                    a_n__color[n_idx * 3] = n_r;
                    a_n__color[n_idx * 3 + 1] = n_g;
                    a_n__color[n_idx * 3 + 2] = n_b;
                }
                o_geometry.setAttribute('color', new THREE.BufferAttribute(a_n__color, 3));

                let o_material = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    flatShading: true,
                    side: THREE.DoubleSide,
                });

                // swap mesh in scene
                let o_scene = o_self._o_scene__minimap;
                if (o_self._o_mesh__minimap) {
                    o_scene.remove(o_self._o_mesh__minimap);
                    o_self._o_mesh__minimap.geometry.dispose();
                    o_self._o_mesh__minimap.material.dispose();
                }

                let o_mesh = new THREE.Mesh(o_geometry, o_material);
                // rotate plane to lie horizontal then tilt for isometric view
                o_mesh.rotation.x = -Math.PI / 2;
                o_scene.add(o_mesh);
                o_self._o_mesh__minimap = o_mesh;

                o_self.s_status = '';
            } catch (o_err) {
                // silently ignore preview errors — user didn't request this
                console.warn('minimap preview:', o_err.message);
            } finally {
                o_self.n_resolution = n_resolution__saved;
            }

            o_self.b_minimap__loading = false;
        },

        // ===================== OVERLAY DRAG =====================

        f_drag_start: function (o_evt, s_overlay) {
            let o_self = this;
            o_self._s_drag_overlay = s_overlay;
            let s_key = 'overlay__' + s_overlay;
            let el = o_self.$refs[s_key];
            if (!el) return;
            o_self._n_drag_off_x = o_evt.clientX - el.offsetLeft;
            o_self._n_drag_off_y = o_evt.clientY - el.offsetTop;
            o_evt.target.setPointerCapture(o_evt.pointerId);

            let f_move = function (o_evt2) {
                let n_x = Math.max(0, Math.min(o_evt2.clientX - o_self._n_drag_off_x, window.innerWidth - 100));
                let n_y = Math.max(0, Math.min(o_evt2.clientY - o_self._n_drag_off_y, window.innerHeight - 40));
                let o_style_key = 'o_style__overlay__' + s_overlay;
                o_self[o_style_key] = { left: n_x + 'px', top: n_y + 'px', right: 'auto', bottom: 'auto' };
            };
            let f_up = function () {
                document.removeEventListener('pointermove', f_move);
                document.removeEventListener('pointerup', f_up);
            };
            document.addEventListener('pointermove', f_move);
            document.addEventListener('pointerup', f_up);
        },
    },
};

// cache the stl_pipeline imports for use in f_o_geometry__solid_plane
import { f_o_geometry__solid_plane as _f_o_geometry__solid_plane } from "./stl_pipeline.js";
let await_import_cache = { f_o_geometry__solid_plane: _f_o_geometry__solid_plane };

export { o_component__unified };
