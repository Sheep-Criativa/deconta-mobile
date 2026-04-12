import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FAQInfo = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: FAQInfo[] = [
  {
    id: '1',
    question: 'Como redefinir minha senha?',
    answer:
      'Para alterar sua senha, vá em Configurações > Alterar Senha. Digite a sua nova senha duas vezes para confirmar a mudança. Lembre-se, caso tenha esquecido, use a opção de recuperação na tela de login.',
  },
  {
    id: '2',
    question: 'Como alterar meus dados pessoais?',
    answer:
      'Acesse Configurações > Dados Pessoais. Lá você poderá editar seu nome e e-mail. Por medida de segurança, o aplicativo pedirá sua senha atual para confirmar as edições.',
  },
  {
    id: '3',
    question: 'Minhas informações estão seguras?',
    answer:
      'Sim, a DeConta utiliza as tecnologias mais avançadas de criptografia e conformidade de proteção de dados. Seus dados nunca são compartilhados sem sua autorização.',
  },
  {
    id: '4',
    question: 'O aplicativo é gratuito?',
    answer:
      'Sim, o acesso à nossa plataforma pelo app mobile é totalmente gratuito para o gerenciamento das suas informações.',
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleEmailSupport = async () => {
    const email = 'deconta.noreply@gmail.com';
    const subject = 'Suporte - DeConta Mobile';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert('Erro', `Não foi possível abrir o seu aplicativo de e-mail. Por favor, envie manualmente para: ${email}`);
      }
    } catch (err) {
      Alert.alert('Erro', `Houve um problema ao tentar abrir o e-mail.\n\nContate-nos via: ${email}`);
    }
  };

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Central de Ajuda',
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#18181b',
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
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <Text style={styles.sectionSubtitle}>
            Nossa equipe de suporte está sempre disponível para te ajudar.
          </Text>

          {/* Card de Contato E-mail */}
          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.7} 
            onPress={handleEmailSupport}
          >
            <View style={styles.contactIconBox}>
              <Feather name="mail" size={24} color="#10b981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Enviar E-mail</Text>
              <Text style={styles.contactDesc}>deconta.noreply@gmail.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#a1a1aa" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          
          {/* FAQ Accordion */}
          <View style={styles.faqList}>
            {FAQS.map((faq) => {
              const isOpen = openFAQ === faq.id;
              
              return (
                <View key={faq.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleFAQ(faq.id)}
                  >
                    <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>
                      {faq.question}
                    </Text>
                    <Feather
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isOpen ? '#10b981' : '#a1a1aa'}
                    />
                  </TouchableOpacity>
                  
                  {isOpen && (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#71717a',
    marginBottom: 20,
    lineHeight: 22,
  },
  
  // Contact Card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ecfdf5', // green-50
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
  },
  contactDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#71717a',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 32,
  },

  // FAQ
  faqList: {
    marginTop: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#27272a',
    paddingRight: 16,
    lineHeight: 22,
  },
  faqQuestionOpen: {
    color: '#10b981', // green-500
  },
  faqBody: {
    paddingBottom: 20,
    paddingRight: 24,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#71717a',
    lineHeight: 22,
  },
});
