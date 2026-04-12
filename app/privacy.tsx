import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Política de Privacidade',
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#18181b', // User preferred dark header
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 16,
          }
        }} 
      />
      <View style={styles.root}>
        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lastUpdate}>Última atualização: 11 de Abril de 2026</Text>

          <Text style={styles.title}>1. Coleta de Informações</Text>
          <Text style={styles.paragraph}>
            Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar no
            aplicativo DeConta, como nome, endereço de e-mail e dados de transações financeiras. 
            Essas informações são essenciais para o funcionamento dos nossos serviços no seu 
            dia a dia.
          </Text>

          <Text style={styles.title}>2. Uso dos seus Dados</Text>
          <Text style={styles.paragraph}>
            A DeConta utiliza os dados coletados com a finalidade de fornecer, manter e aprimorar 
            nossos serviços financeiros, garantindo a sua segurança, verificando sua identidade e 
            prevenindo fraudes.
          </Text>

          <Text style={styles.title}>3. Compartilhamento com Terceiros</Text>
          <Text style={styles.paragraph}>
            Não vendemos suas informações pessoais. Podemos compartilhar seus dados com prestadores
            de serviços estritamente necessários para a operação funcional da plataforma (como 
            servidores em nuvem criptografados) ou quando exigido por lei.
          </Text>

          <Text style={styles.title}>4. Segurança da Informação</Text>
          <Text style={styles.paragraph}>
            Adotamos medidas rigorosas de segurança administrativa, técnica e física (incluindo 
            criptografia de ponta a ponta nas senhas) para proteger seus dados contra acesso 
            não autorizado, perda ou alteração.
          </Text>

          <Text style={styles.title}>5. Seus Direitos (LGPD)</Text>
          <Text style={styles.paragraph}>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar
            o acesso, a correção e até mesmo a exclusão das suas informações pessoais gravadas 
            na plataforma diretamente pelo painel de Dados Pessoais ou via Central de Ajuda.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>DeConta LTDA.</Text>
            <Text style={styles.footerText}>Todos os direitos reservados.</Text>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  lastUpdate: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#a1a1aa',
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
    marginTop: 8,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#52525b',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 4,
  },
});
