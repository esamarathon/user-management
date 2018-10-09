<template>
  <div>
    <h1>Users</h1>

    <div class="user-list">
      <md-table class="users transparent-table" v-model="users" md-sort="id">
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
          <md-table-cell md-label="Twitter">{{item.connections.twitter.name ? "@"+item.connections.twitter.name : ""}}</md-table-cell>
          <md-table-cell md-label="Discord">{{item.connections.discord.name ? "@"+item.connections.discord.name : ""}}</md-table-cell>
          <md-table-cell md-label="Flag" md-sort-by="name"><i :class="'flag flag-'+item.flag" ></i></md-table-cell>
          <md-table-cell md-label="Roles">{{item.roles}}</md-table-cell>
        </md-table-row>
      </md-table>
      <div class="pagination">
        <div class=""></div>
      </div>
    </div>
  </div>
</template>


<script>
import { getUsers } from '../../../api'

export default {
  name: "Users",
  data: ()=>({
    users: [],
    pages: [],
    searchTerm: ""
  }),
  created() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      this.users = await getUsers()
    }
  },
  computed: {
  }
}
</script>

<style lang="scss">
.md-table.transparent-table {
  background-color: transparent !important;
  .md-content {
    background-color: transparent !important;
    color: white !important;
  }

  th.md-table-head {
    color: white !important;
  }

  .md-sortable .md-icon svg {
    color: white !important;
    fill: white !important;
  }

}
</style>
