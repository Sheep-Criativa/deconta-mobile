import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Termos de Uso',
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

          <Text style={styles.title}>1. Aceitação dos Termos</Text>
          <Text style={styles.paragraph}>
            Ao acessar e usar o aplicativo DeConta, você concorda em cumprir e ficar vinculado 
            a estes Termos de Uso. Se você não concorda com qualquer parte destes termos, você 
            não tem permissão para acessar a plataforma.
          </Text>

          <Text style={styles.title}>2. Modificações dos Termos</Text>
          <Text style={styles.paragraph}>
            A DeConta reserva-se o direito de, a qualquer momento, modificar ou substituir estes 
            Termos. Vamos alertá-lo sobre alterações significativas através de nosso aplicativo 
            ou pelo e-mail cadastrado em sua conta.
          </Text>

          <Text style={styles.title}>3. Criação de Conta e Segurança</Text>
          <Text style={styles.paragraph}>
            Para utilizar os recursos do DeConta, você deve criar uma conta, fornecendo dados 
            precisos, completos e atualizados. Você é o único responsável por manter a confidencialidade 
            da sua senha e das atividades realizadas em sua conta.
          </Text>

          <Text style={styles.title}>4. Uso Aceitável</Text>
          <Text style={styles.paragraph}>
            O aplicativo deve ser utilizado de forma lícita para gerenciamento financeiro pessoal.
            Você concorda em não usar o app para qualquer finalidade ilegal ou proibida por 
            estes termos, incluindo engenharia reversa ou ataque aos nossos servidores.
          </Text>

          <Text style={styles.title}>5. Isenção de Responsabilidade</Text>
          <Text style={styles.paragraph}>
            O serviço é fornecido "no estado em que se encontra". A DeConta não garante que 
            o serviço será ininterrupto ou livre de erros em 100% do tempo.
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
