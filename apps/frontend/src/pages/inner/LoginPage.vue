<script lang="ts" setup>
import { ref } from 'vue';
import { ApiError } from '@/api/api_error';
import KtButton from '@/components/ui/KtButton.vue';
import KtCard from '@/components/ui/KtCard.vue';
import KtFormItem from '@/components/ui/KtFormItem.vue';
import KtTextInput from '@/components/ui/KtTextInput.vue';
import { useGlobalLoading } from '@/composables/use_global_loading';
import type { LoginPageContext } from '../generated/LoginPageEntryPoint.vue';

const props = defineProps<{
  context: LoginPageContext;
}>();

const { isLoading, withLoading } = useGlobalLoading();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const onSubmit = async () => {
  errorMessage.value = '';

  await withLoading(async () => {
    try {
      await props.context.apis.login({
        email: email.value,
        password: password.value,
      });
      props.context.navigations.toHome();
    } catch (e) {
      errorMessage.value =
        e instanceof ApiError ? e.message : 'ログインに失敗しました。';
    }
  });
};
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-10">
    <KtCard title="ログイン">
      <form
        class="flex flex-col space-y-4"
        @submit.prevent="onSubmit"
      >
        <KtFormItem
          label="メールアドレス"
          :error-message="errorMessage"
        >
          <KtTextInput
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="user@example.com"
          />
        </KtFormItem>

        <KtFormItem label="パスワード">
          <KtTextInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="パスワード"
          />
        </KtFormItem>

        <KtButton
          type="submit"
          :disabled="isLoading"
          >ログイン</KtButton
        >
      </form>
    </KtCard>
  </div>
</template>
