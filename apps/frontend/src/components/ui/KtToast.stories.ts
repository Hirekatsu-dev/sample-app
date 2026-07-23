import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { action } from 'storybook/actions';
import { expect, fn, within } from 'storybook/test';
import TestID from '@/test_util/data_testid';
import KtToast from './KtToast.vue';

const meta = {
  component: KtToast,
  argTypes: {
    message: { control: 'text', description: 'トーストに表示するメッセージ' },
    type: {
      control: 'radio',
      options: ['info', 'success', 'warning', 'error'],
      description: 'トーストの種類（スタイル）',
    },
    timeout: {
      control: 'number',
      description:
        'トーストが自動的に閉じるまでの時間（ミリ秒）。null の場合、手動で削除可能。',
    },
  },
  args: {
    message: '',
    timeout: null,
    onClose: action('close'),
  },
} satisfies Meta<typeof KtToast>;
export default meta;

type Story = StoryObj<typeof meta>;

const Template: Story = {};

export const Default: Story = {
  ...Template,
  args: {
    message: 'This is an info Kttoast.',
    type: 'info',
    timeout: null,
  },
};

export const AutoClose: Story = {
  ...Template,
  args: {
    message: 'This Kttoast will close in 3 seconds.',
    type: 'success',
    timeout: 3000,
  },
};

export const interactionManualClose: Story = {
  ...Default,
  args: {
    onClose: fn(),
    timeout: null,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toast = canvas.getByTestId(TestID.ktToast);
    expect(toast).toBeTruthy();

    // 閉じるボタンをクリックしたら close イベントが発火する
    const closeButton = canvas.getByTestId(TestID.ktToastButton);
    expect(closeButton).toBeTruthy();
    closeButton?.click();
    expect(args.onClose).toHaveBeenCalled();
  },
};

export const interactionAutoClose: Story = {
  ...AutoClose,
  args: {
    onClose: fn(),
    timeout: 1000,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toast = canvas.getByTestId(TestID.ktToast);
    expect(toast).toBeTruthy();

    // 1秒後に close イベントが発火する
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(args.onClose).toHaveBeenCalled();
  },
};
