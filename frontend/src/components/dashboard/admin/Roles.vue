<template>
  <div class="layout-column" v-if="roles && user">
    <h1>Roles</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newRole()">New Role</md-button>
    </div>
    <div class="role-list">
      <div class="role-item layout-row md-elevation-2" v-for="role in roles" :key="role._id">
        <div class="flex-100 layout-column">
          <div class="role-header flex-none">{{role.name}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectRole(role)"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="duplicateRole(role)"><md-icon>library_add</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteRole(role)"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>Edit role</md-dialog-title>
      <md-dialog-content>
        <form v-if="selectedRole" class="layout-padding">
          <div class="layout-row layout-wrap">
            <md-field class="large-field">
              <label for="name">Name</label>
              <md-input name="name" id="name" v-model="selectedRole.name" />
            </md-field>
            <md-switch v-model="selectedRole.special" class="medium-field switch-inline">Special role (cannot be applied for)</md-switch>
            <md-field class="medium-field">
              <label>Permissions</label>
              <md-select class="medium-field" multiple v-model="selectedRole.permissions">
                <md-option v-for="permission in permissions" :key="permission" :value="permission">
                  {{permission}}
                </md-option>
              </md-select>
            </md-field>
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveRole()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import settings from '../../../settings';
import { generateID } from '../../../helpers';

export default {
  name: 'Roles',
  data: ()=>({
    selectedRole: null,
    showDialog: false,
    permissions: settings.permissions
  }),
  created() {
    this.$store.dispatch('getRoles');
  },
  computed: {
    ...mapState(['user', 'roles']),
    ...mapGetters(['currentEvent'])
  },
  methods: {
    newRole() {
      const newRole = {
        _id: generateID(),
        name: "",
        permissions: [],
        special: false
      }
      this.selectedRole = newRole;
      this.showDialog = true;
    },
    selectRole(role) {
      this.selectedRole = _.merge({}, role);
      this.showDialog = true;
    },
    duplicateRole(role) {
      this.selectedRole = _.merge({}, role, {id: generateID()});
      this.showDialog = true;
    },
    deleteRole(role) {
      this.$store.dispatch('deleteRole', role);
    },
    saveRole() {
      this.$store.dispatch('saveRole', this.selectedRole);
      this.showDialog = false;
    }
  }
};
</script>

<style lang="scss">
.role-item {
  padding: 8px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;
  max-width: 520px;

  .role-header {
    font-size: large;
  }
}

.switch-inline {
  position: relative;
  top: 10px;
}

.md-switch {
  margin-left: 16px;
}
</style>
