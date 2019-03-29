import Vue from 'vue';

export default Vue.component('linkified', {
  render(c) {
    const parts = [];
    let m;
    let lastIndex = 0;
    const rx = /\[([^\]]+)\](?:\(([^)]+)\))?/g;
    while (m = rx.exec(this.text)) { // eslint-disable-line no-cond-assign
      parts.push(this.text.slice(lastIndex, m.index));
      lastIndex = m.index + m[0].length;
      try {
        const routerLink = JSON.parse(m[1]);
        parts.push(c('router-link', { props: { to: routerLink } }, m[2] || routerLink.name));
      } catch (err) {
        parts.push(c('a', { attrs: { href: `${m[1]}` } }, m[2] || m[1]));
      }
    }
    parts.push(this.text.slice(lastIndex));
    console.log(parts);
    return c('span', {}, parts);
  },
  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
