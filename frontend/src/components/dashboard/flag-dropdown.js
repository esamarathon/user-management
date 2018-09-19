import COUNTRIES from './countries.json';

export default {
  data: () => ({
    isOpen: false,
    countries: COUNTRIES,
  }),
  props: {
    selected: String,
  },
  // A data object containing all data for this component.
  // Methods, we will bind these later on.
  methods: {
    onFlagChange(id, iso) {
      const data = { id, iso };
      this.$emit('change', data);
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
    show() {
      this.isOpen = true;
    },
    hide() {
      this.isOpen = false;
    },
    jumpTo(event) {
      // console.log("JumpTo called!", event)
      const key = event.key.toUpperCase();
      let index = 1; // skip the first element since thats "Not set"
      for (;index < this.countries.length && this.countries[index].nicename[0] < key; ++index) { /* do nothing */ }
      this.$el.children[1].children[0].children[Math.min(index, this.countries.length - 1)].scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  },
};
