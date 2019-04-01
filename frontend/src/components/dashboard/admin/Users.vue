<template>
  <div>
    <h1>Users</h1>

    <div class="user-list">
      <md-table class="users transparent-table" v-model="users" md-sort="id">
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Name" md-sort-by="name">{{item.connections.twitch.displayName}}</md-table-cell>
          <md-table-cell md-label="Twitter">{{item.connections.twitter ? "@"+item.connections.twitter.handle : ""}}</md-table-cell>
          <md-table-cell md-label="Discord">{{item.connections.discord ? item.connections.discord.name + "#" + item.connections.discord.discriminator : ""}}</md-table-cell>
          <md-table-cell md-label="Speedrun.com"><a :href="`https://speedrun.com/user/${item.connections.srdotcom ? item.connections.srdotcom.name : ''}`">{{item.connections.srdotcom ? item.connections.srdotcom.name : ""}}</a></md-table-cell>
          <md-table-cell md-label="Flag"><i :class="`flag flag-${item.flag||'xx'}`" ></i></md-table-cell>
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
        <div class="layout-row">
          <div class="flex-none">
            <img :src="selectedUser.connections.twitch.logo" class="rounded-profilepic">
          </div>
          <div class="layout-column flex">
            <div class="layout-row">
              <div class="flex-20">Twitch name</div>
              <div class="medium-field">{{selectedUser.connections.twitch.displayName}}</div>
            </div>
            <div v-if="selectedUser.connections.discord" class="layout-row">
              <div class="flex-20">Discord user</div>
              <div class="medium-field">{{selectedUser.connections.discord.name}}#{{selectedUser.connections.discord.discriminator}}</div>
            </div>
            <div v-if="selectedUser.connections.twitter" class="layout-row">
              <div class="flex-20">Twitter handle</div>
              <div class="medium-field">{{selectedUser.connections.twitter ? '@'+selectedUser.connections.twitter.handle : ''}}</div>
            </div>
            <div v-if="selectedUser.connections.srdotcom" class="layout-row">
              <div class="flex-20">Speedrun.com name</div>
              <div class="medium-field" v-if="selectedUser.connections.srdotcom"><a :href="`https://speedrun.com/user/${selectedUser.connections.srdotcom.name}`">{{selectedUser.connections.srdotcom.name}}</a></div>
            </div>
            <div class="layout-row">
              <div class="flex-20">Availability</div>
              <div class="medium-field">{{getAvailability(selectedUser)}}</div>
            </div>
            <div class="layout-row">
              <div class="flex-20">Flag</div>
              <div class="medium-field"><i :class="['flag-overlay flag', `flag-${selectedUser.flag||'xx'}`]"></i></div>
            </div>
          </div>
        </div>
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


<script src="./users.js"></script>

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

img.rounded-profilepic {
  height: 100px;
  border-radius: 10px;
  margin-right: 16px;
}

</style>
