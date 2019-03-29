<template>
  <div>
    <h1>Users</h1>

    <div class="user-list">
      <md-table class="users transparent-table" v-model="users" md-sort="id">
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
          <md-table-cell md-label="Twitter">{{item.connections.twitter.handle ? "@"+item.connections.twitter.handle : ""}}</md-table-cell>
          <md-table-cell md-label="Discord">{{item.connections.discord.name ? item.connections.discord.name + "#" + item.connections.discord.discriminator : ""}}</md-table-cell>
          <md-table-cell md-label="Flag" md-sort-by="name"><i :class="`flag flag-${item.flag||'xx'}`" ></i></md-table-cell>
          <md-table-cell md-label="Roles">{{roleString(item)}}</md-table-cell>
          <md-table-cell md-label="" class="table-buttons"><md-button class="md-icon-button" @click="editUser(item)"><md-icon>edit</md-icon></md-button></md-table-cell>
        </md-table-row>
      </md-table>
      <div class="pagination">
        <div class=""></div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false" v-if="selectedUser">
      <md-dialog-title>Edit user {{selectedUser.name}}</md-dialog-title>
      <md-dialog-content>
        {{selectedUser}}
        <h2>Roles</h2>
        <div v-for="eventRole in selectedUser.roles" :key="eventRole._id">
          <!--{{eventRole}}-->
          <div class="role layout-row">
            <div class="flex-25 layout-column layout-center-start">
              <span class="roleName">{{eventRole.role.name}}</span>
            </div>
            <div class="flex-25">
              <md-field class="compact">
                <label for="event">Event</label>
                <md-select v-model="eventRole.event" name="event" id="event">
                  <md-option :value="'global'">Global</md-option>
                  <md-option v-for="possibleEvent in events" :value="possibleEvent._id" :key="possibleEvent._id">{{possibleEvent.name}}</md-option>
                </md-select>
              </md-field>
            </div>
            <div class="flex-50 layout-end-center layout-row">
              <div>
                <md-button class="md-icon-button" @click="deleteRole(eventRole)"><md-icon>delete</md-icon></md-button>
              </div>
            </div>
          </div>
        </div>
        <div class="layout-row">
          <div class="flex-25">
            <md-field class="compact">
              <label for="role">Role</label>
              <md-select v-model="roleAdd" name="role" id="role">
                <md-option v-for="role in roles" :value="role._id" :key="role._id">{{role.name}}</md-option>
              </md-select>
            </md-field>
          </div>
          <div class="flex-25">
            <md-button @click="addRole(roleAdd)">Add role</md-button>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveUser()">Save changes</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>


<script>
import _ from 'lodash';
import { getUsers } from '../../../api';
import { mapState } from 'vuex';
import { generateID, mergeNonArray } from '../../../helpers';

export default {
  name: "Users",
  data: ()=>({
    users: [],
    pages: [],
    searchTerm: "",
    showDialog: false,
    selectedUser: null,
    roleAdd: null
  }),
  async created() {
    if(!this.roles) await this.$store.dispatch("getRoles");
    this.users = await getUsers();
    _.each(this.users, user => {
      _.each(user.roles, eventRole => {
        if(!eventRole.event) eventRole.event = "global";
        eventRole.role = _.find(this.roles, {_id: eventRole.role});
      });
    });
  },
  methods: {
    editUser(user) {
      this.selectedUser = _.cloneDeep(user);
      this.showDialog = true;
    },
    async saveUser() {
      await this.$store.dispatch("saveUser", this.selectedUser);
      mergeNonArray(_.find(this.users, {_id: this.selectedUser._id}), this.selectedUser);
      this.showDialog = false;
      this.selectedUser = null;
    },
    deleteRole(role) {
      this.selectedUser.roles.splice(this.selectedUser.roles.indexOf(role),1);
    },
    addRole(role) {
      if(!role) return;
      this.selectedUser.roles.push({
        _id: generateID(),
        event: "global",
        role: _.find(this.roles, {_id: role})
      });
      console.log(this.selectedUser.roles);
    },
    roleString(user) {
      const result = _.map(_.filter(user.roles, eventRole => eventRole.event === "global" || eventRole.event === this.currentEventID), eventRole => eventRole.role.name).join(", ");
      return result;
    }
  },
  computed: {
    ...mapState(['events', 'roles', 'currentEventID']),
  }
}
</script>

<style lang="scss">
.table-buttons {
  width: 30px; /* the actual width is determined by vue-material, but this makes it as small as possible */
}

.role {
  background-color: rgba(0,0,0,0.5);
  padding: 8px;
  margin-bottom: 8px;

  .roleName {
    font-size: large;
  }
}
</style>
