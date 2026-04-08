import { View } from 'react-native';

// Esta tela existe apenas para satisfazer o roteamento do Expo Router.
// O botão "+" na toolbar é customizado no _layout.tsx e abre o QuickActionsMenu,
// nunca navegando diretamente para esta tela.
export default function AddScreen() {
  return <View />;
}
