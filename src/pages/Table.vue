<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <q-layout>
    <q-header>
    </q-header>

    <q-page-container class="container">
      <q-page class="page">
      <div class="banner">Usuários</div>
        <div class="search-label">
          <q-btn  icon="save" @click="openDialog" label="Adicionar Usuário" class="search-label-button" color="primary" />
          <q-input
            v-model="search"
            debounce="300"
            placeholder="Pesquisar por nome..."
            class="search-label-input"
            outlined
          />
        </div>

          <q-table
            :rows="filteredUsers"
            :columns="columns"
            row-key="id"
            class="table"
            :rows-per-page="7"
          >
            <template v-slot:body-cell-actions="props" >
              <div class="actions-btn">
                <q-btn @click="editUser(props.row)" class="actions-btn-edit" icon="edit" size="sm" color="orange" />
                <q-btn @click="destroyUser(props.row.id)" class="actions-btn-delete" icon="delete" size="sm" color="negative" />              
              </div>
            </template>
          </q-table>

          <q-dialog v-model="dialog" @click.self="closeDialog">
            <q-card class="card">
              <q-card-section>
                <div class="text-h6">{{ isEdit ? 'Editar Usuário' : 'Adicionar Usuário' }}</div>
              </q-card-section>
              <q-card-section>
                <q-input v-model="form.name" label="Nome" />
                <q-input v-model="form.age" label="Idade" type="number" />
                <q-input v-model="form.email" label="Email" type="email" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn @click="saveUser" label="Salvar" color="primary" />
                <q-btn @click="closeDialog" label="Cancelar" flat />
              </q-card-actions>
            </q-card>
          </q-dialog>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios, { AxiosError } from 'axios';
import { Notify } from 'quasar';
import { format } from 'date-fns';


interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default defineComponent({
  name: 'UserTable',
  setup() {
    const users = ref<User[]>([]);
    const search = ref('');
    const dialog = ref(false);
    const isEdit = ref(false);
    const form = ref<User>({ id: 0, name: '', age: 0, email: '', createdAt: '', updatedAt: '' });

    const columns = ref([
      { name: 'name', label: 'Nome', field: 'name', align: 'left' as const, sortable: true },
      { name: 'age', label: 'Idade', field: 'age', align: 'left' as const, sortable: true },
      { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
      { name: 'createdAt', label: 'Criado em', field: 'createdAt', align: 'left' as const, sortable: true },
      { name: 'actions', label: 'Ações', align: 'center' as const, field: (row: User) => row, sortable: false },
    ]);

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/users`);
        users.value = response.data;
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    const filteredUsers = computed(() => {
      return users.value.filter(user =>
        user.name.toLowerCase().includes(search.value.toLowerCase())
      )
      .map(user => ({
      ...user,
      createdAt: format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm'), 
    })
  );
    });

    const openDialog = () => {
      isEdit.value = false;
      form.value = { id: 0, name: '', age: 0, email: '', createdAt: '', updatedAt: '' };
      dialog.value = true;
    };

    const saveUser = async () => {
    try {
      if (isEdit.value) {
        await axios.put(`${process.env.VUE_APP_API_URL}/users${form.value.id}`, form.value);
      } else {
        await axios.post(`${process.env.VUE_APP_API_URL}/users`, form.value);
      }

      await fetchUsers();

      Notify.create({
        type: 'positive',
        message: isEdit.value ? 'Usuário editado com sucesso!' : 'Usuário salvo com sucesso!',
        position: 'top',
      });

      closeDialog();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {  
        if (error.response && error.response.data && error.response.data.errors) {
          const errorMessages = error.response.data.errors
            .map((err: { message: string }) => err.message)
            .join('\n');

          Notify.create({
            type: 'negative',
            message: errorMessages,
            position: 'top',
            color: 'red',
          });
        } else {
          Notify.create({
            type: 'negative',
            message: 'Erro inesperado ao salvar o usuário.',
            position: 'top',
            color: 'red',
          });
        }
      } else {
        console.error('Erro não identificado:', error);
        Notify.create({
          type: 'negative',
          message: 'Erro desconhecido. Verifique o console para mais detalhes.',
          position: 'top',
          color: 'red',
        });
      }
    }
};

    const editUser = (user: User) => {
      isEdit.value = true;
      form.value = { ...user };
      dialog.value = true;
    };

    const destroyUser = async (id: number) => {
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/users/${id}`);
        await fetchUsers();
        Notify.create({
          type: 'positive',
          message: 'Usuário deletado com sucesso!',
          position: 'top',
          color: 'green',
        });

      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        Notify.create({
          type: 'negative',
          message: 'Ocorreu um erro ao deletar o usuário!',
          position: 'top',
          color: 'red',
        });
      }
    };

    const closeDialog = () => {
      dialog.value = false;
    };

    onMounted(fetchUsers);

    return {
      users,
      search,
      columns,
      dialog,
      isEdit,
      form,
      filteredUsers,
      openDialog,
      closeDialog,
      saveUser,
      editUser,
      destroyUser,
    };
  },
});
</script>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  height: 120px;

  font-size: 32px;
  color: black;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);

}

.container {
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: blanchedalmond;
}

.page {
  display: flex;
  flex-direction: column;
  width: 1200px;
  padding: 20px;

  background-color: blanchedalmond;
}

.search-label {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-bottom: 5px;
}

.search-label-input {
  width: 100%;
}

.search-label-button {
  margin-left: 10px;
}

.table {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.custom-height {
    display: flex;
  }
  .custom-width {
    width: 1200px;
  }

.card {
  width: 1200px;
}

.actions-btn {
  display: flex;
  justify-content: center;
  padding: 5px;
}

.actions-btn-delete {
  margin-left: 3px;
  width: 40px;
  margin-top: 5px;
}

.actions-btn-edit {
  margin-right: 3px;
  width: 40px;
  margin-top: 5px;

}
</style>
