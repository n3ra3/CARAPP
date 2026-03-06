import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../App';

export default function AddExpenseScreen({ route, navigation }) {
  const { carId, carName } = route.params;
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/expenses/categories');
      setCategories(res.data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const isFuel = selectedCategory?.name?.toLowerCase().includes('топливо');

  const handleSave = async () => {
    if (!categoryId || !amount) {
      Alert.alert('Ошибка', 'Выберите категорию и укажите сумму');
      return;
    }

    setLoading(true);
    try {
      await api.post('/expenses', {
        car_id: carId,
        category_id: categoryId,
        amount: parseFloat(amount),
        description: description || null,
        date,
        mileage: mileage ? parseInt(mileage) : null,
        liters: liters ? parseFloat(liters) : null,
        price_per_liter: pricePerLiter ? parseFloat(pricePerLiter) : null
      });
      Alert.alert('Успешно', 'Расход добавлен', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось добавить');
    } finally {
      setLoading(false);
    }
  };

  // Автоматический расчёт суммы для топлива
  useEffect(() => {
    if (isFuel && liters && pricePerLiter) {
      const total = parseFloat(liters) * parseFloat(pricePerLiter);
      setAmount(total.toFixed(2));
    }
  }, [liters, pricePerLiter, isFuel]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Отмена</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Добавить расход</Text>
        <Text style={styles.subtitle}>{carName}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Категория *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categoryId}
            onValueChange={setCategoryId}
            style={styles.picker}
          >
            <Picker.Item label="Выберите категорию" value={null} />
            {categories.map(c => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>

        {isFuel && (
          <>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Литры</Text>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  value={liters}
                  onChangeText={setLiters}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Цена за литр</Text>
                <TextInput
                  style={styles.input}
                  placeholder="55.50"
                  value={pricePerLiter}
                  onChangeText={setPricePerLiter}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </>
        )}

        <Text style={styles.label}>Сумма (₽) *</Text>
        <TextInput
          style={styles.input}
          placeholder="1500"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Дата</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-01-15"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Пробег (км)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Комментарий..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Сохранение...' : 'Добавить расход'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  back: {
    color: '#2563eb',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
