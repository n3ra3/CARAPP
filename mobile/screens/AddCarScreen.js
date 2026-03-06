import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../App';

export default function AddCarScreen({ navigation }) {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [brandId, setBrandId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (brandId) {
      loadModels(brandId);
    } else {
      setModels([]);
      setModelId(null);
    }
  }, [brandId]);

  const loadBrands = async () => {
    try {
      const res = await api.get('/catalog/brands');
      setBrands(res.data.brands);
    } catch (e) {
      console.error(e);
    }
  };

  const loadModels = async (id) => {
    try {
      const res = await api.get(`/catalog/brands/${id}/models`);
      setModels(res.data.models);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!brandId || !modelId) {
      Alert.alert('Ошибка', 'Выберите марку и модель');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cars', {
        brand_id: brandId,
        model_id: modelId,
        year: year ? parseInt(year) : null,
        mileage: mileage ? parseInt(mileage) : 0,
        license_plate: licensePlate || null,
        vin: vin || null
      });
      Alert.alert('Успешно', 'Автомобиль добавлен', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось добавить');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Отмена</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Добавить авто</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Марка *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={brandId}
            onValueChange={setBrandId}
            style={styles.picker}
          >
            <Picker.Item label="Выберите марку" value={null} />
            {brands.map(b => (
              <Picker.Item key={b.id} label={b.name} value={b.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Модель *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={modelId}
            onValueChange={setModelId}
            style={styles.picker}
            enabled={models.length > 0}
          >
            <Picker.Item label="Выберите модель" value={null} />
            {models.map(m => (
              <Picker.Item key={m.id} label={m.name} value={m.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Год выпуска</Text>
        <TextInput
          style={styles.input}
          placeholder="2020"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={styles.label}>Пробег (км)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Госномер</Text>
        <TextInput
          style={styles.input}
          placeholder="А123БВ777"
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
          maxLength={20}
        />

        <Text style={styles.label}>VIN</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXXXXXXXXXXXXXXX"
          value={vin}
          onChangeText={setVin}
          autoCapitalize="characters"
          maxLength={17}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Сохранение...' : 'Добавить'}
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
