iD.ui.preset = function(context) {
    var event = d3.dispatch('change', 'setTags', 'close'),
        entity,
        tags,
        keys,
        preset,
        formwrap,
        formbuttonwrap;

    function input(d) {
        var i = iD.ui.preset[d.type](d, context)
            .on('close', event.close)
            .on('change', event.change);

        event.on('setTags.' + d.key || d.type, function(tags) {
            i.tags(_.clone(tags));
        });

        if (d.type === 'address') i.entity(entity);

        keys = keys.concat(d.key ? [d.key] : d.keys);

        d3.select(this).call(i);
    }

    function presets(selection) {

        selection.html('');
        keys = [];

        formwrap = selection.append('div');

        var geometry = entity.geometry(context.graph());
        draw(formwrap, preset.fields.filter(function(f) {
            return f.matchGeometry(geometry);
        }));

        var wrap = selection.append('div')
            .attr('class', 'col12 more-buttons inspector-inner');

        var wraplabel = wrap.append('h4');

        wraplabel.append('div')
            .attr('class', 'icon add-form');

        wraplabel.append('span')
            .attr('class', 'deemphasize')
            .text(t('inspector.show_additional'));

       formbuttonwrap = wrap.append('div')
            .attr('class', 'col9 preset-input');

        formbuttonwrap.selectAll('button')
            .data(context.presets().universal())
            .enter()
            .append('button')
                .attr('class', 'preset-add-field')
                .on('click', addForm)
                .each(tooltip)
                .append('span')
                    .attr('class', function(d) { return 'icon ' + d.icon; });

        function tooltip(d) {
            d3.select(this).call(bootstrap.tooltip()
                .placement('top')
                .title(d.label()));
        }

        function addForm(d) {
            draw(formwrap, [d]);
            d3.select(this).remove();
            if (!wrap.selectAll('button').node()) wrap.remove();
        }

        if (!preset.additional || !preset.additional.length) wrap.remove();
    }

    function formKey(d) {
        return d.key || String(d.keys);
    }

    function draw(selection, fields) {
        var sections = selection.selectAll('div.preset-section')
            .data(fields, formKey)
            .enter()
            .append('div')
            .attr('class', 'preset-section fillL inspector-inner col12');

        sections.append('h4')
            .attr('for', function(d) { return 'input-' + d.key; })
            .text(function(d) { return d.label(); });

        sections.each(input);
    }

    presets.rendered = function() {
        return keys;
    };

    presets.preset = function(_) {
        if (!arguments.length) return preset;
        preset = _;
        return presets;
    };

    presets.change = function(t) {
        tags = t;

        function haveKey(k) { return k && !!tags[k]; }

        formbuttonwrap.selectAll('button').each(function(p) {
            if (haveKey(p.key) || _.any(p.keys, haveKey)) {
                draw(formwrap, [p]);
                d3.select(this).remove();
            }
        });

        event.setTags(tags);
        return presets;
    };

    presets.entity = function(_) {
        if (!arguments.length) return entity;
        entity = _;
        return presets;
    };

    return d3.rebind(presets, event, 'on');
};
