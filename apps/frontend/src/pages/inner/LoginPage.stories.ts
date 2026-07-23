import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type {
  LoginPageApis,
  LoginPageContext,
} from '../generated/LoginPageEntryPoint.vue';
import LoginPage from './LoginPage.vue';

// ログインAPIの挙動を差し替えられるようにモックを組み立てる。
const buildContext = (login: LoginPageApis['login']): LoginPageContext => ({
  apis: {
    login,
    getMe: () => Promise.reject(new Error('未使用')),
  },
  navigations: {
    toHome: () => alert('ログイン成功: ホームへ遷移'),
  },
});

const meta = {
  component: LoginPage,
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const success: Story = {
  args: {
    context: buildContext(async () => ({
      resultCode: '00101',
      data: {
        userId: '49f3e8b0-9bf6-4269-9d74-6fbd9fcc74a7',
        accessToken: 'dummy-token',
      },
    })),
  },
};

export const failure: Story = {
  args: {
    context: buildContext(() =>
      Promise.reject(new Error('ログインに失敗しました。')),
    ),
  },
};
