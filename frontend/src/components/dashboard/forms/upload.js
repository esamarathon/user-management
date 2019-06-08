
import { uploadApplicationSoundFile } from '../../../api';

export default {
  name: 'Upload',
  data: () => ({
    chosenValue: null,
    chosenFileName: '',
    status: 0,
  }),
  props: ['value'],
  created() {
    this.chosenValue = this.value;
  },
  methods: {
    choose() {
      this.$refs.fileInput.click();
    },
    async upload(event) {
      const file = this.$refs.fileInput.files[0];
      if (file) {
        console.log('File selected:', file);
        this.chosenFileName = file.name;
        this.status = 1;
        try {
          const res = await uploadApplicationSoundFile(file);
          this.chosenValue = res.url;
          this.$emit('input', this.chosenValue);
          this.status = 2;
        } catch (err) {
          this.$toasted.error(`Upload error: ${err}`);
          this.status = 3;
        }
      }
    },
  },
};
