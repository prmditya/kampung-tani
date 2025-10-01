import pytest
import json
from unittest.mock import patch, MagicMock
from app.models.schemas import ValidationError

class TestDeviceAPI:
    """Test cases for Device API endpoints"""
    
    def test_get_devices_success(self, client, mock_db):
        """Test successful device listing"""
        # Mock data
        mock_devices = [
            {
                'id': 1,
                'name': 'Test Device',
                'address': 1,
                'baud_rate': 9600,
                'type': 'sensor',
                'status': 'online',
                'user_name': 'Test User'
            }
        ]
        
        mock_pagination = {
            'page': 1,
            'per_page': 50,
            'total': 1,
            'pages': 1
        }
        
        with patch('app.services.device_service.device_service.get_all_devices') as mock_get_devices:
            mock_get_devices.return_value = {
                'devices': mock_devices,
                'pagination': mock_pagination
            }
            
            response = client.get('/api/v1/devices')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert len(data['data']) == 1
            assert data['data'][0]['name'] == 'Test Device'
            assert 'pagination' in data
    
    def test_get_devices_with_pagination(self, client):
        """Test device listing with pagination parameters"""
        with patch('app.services.device_service.device_service.get_all_devices') as mock_get_devices:
            mock_get_devices.return_value = {
                'devices': [],
                'pagination': {'page': 2, 'per_page': 10, 'total': 0, 'pages': 0}
            }
            
            response = client.get('/api/v1/devices?page=2&per_page=10')
            
            assert response.status_code == 200
            mock_get_devices.assert_called_once_with(page=2, per_page=10)
    
    def test_get_device_by_id_success(self, client):
        """Test successful device retrieval by ID"""
        mock_device = {
            'id': 1,
            'name': 'Test Device',
            'address': 1,
            'baud_rate': 9600,
            'type': 'sensor',
            'status': 'online'
        }
        
        with patch('app.services.device_service.device_service.get_device_by_id') as mock_get_device:
            mock_get_device.return_value = mock_device
            
            response = client.get('/api/v1/devices/1')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['name'] == 'Test Device'
    
    def test_get_device_by_id_not_found(self, client):
        """Test device retrieval with non-existent ID"""
        with patch('app.services.device_service.device_service.get_device_by_id') as mock_get_device:
            mock_get_device.return_value = None
            
            response = client.get('/api/v1/devices/999')
            
            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Device not found' in data['message']
    
    def test_create_device_success(self, client):
        """Test successful device creation"""
        device_data = {
            'name': 'New Device',
            'address': 2,
            'baud_rate': 9600,
            'type': 'sensor',
            'user_id': 1
        }
        
        mock_created_device = {
            'id': 2,
            **device_data,
            'status': 'offline'
        }
        
        with patch('app.services.device_service.device_service.create_device') as mock_create:
            mock_create.return_value = mock_created_device
            
            response = client.post(
                '/api/v1/devices',
                data=json.dumps(device_data),
                content_type='application/json'
            )
            
            assert response.status_code == 201
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['name'] == 'New Device'
            assert 'created successfully' in data['message']
    
    def test_create_device_validation_error(self, client):
        """Test device creation with validation error"""
        device_data = {
            'name': '',  # Invalid empty name
            'address': 2,
            'baud_rate': 9600,
            'type': 'sensor',
            'user_id': 1
        }
        
        with patch('app.services.device_service.device_service.create_device') as mock_create:
            mock_create.side_effect = ValidationError("Name is required", "name")
            
            response = client.post(
                '/api/v1/devices',
                data=json.dumps(device_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert 'Name is required' in data['message']
    
    def test_update_device_success(self, client):
        """Test successful device update"""
        update_data = {
            'name': 'Updated Device',
            'baud_rate': 19200
        }
        
        mock_updated_device = {
            'id': 1,
            'name': 'Updated Device',
            'address': 1,
            'baud_rate': 19200,
            'type': 'sensor',
            'status': 'online'
        }
        
        with patch('app.services.device_service.device_service.update_device') as mock_update:
            mock_update.return_value = mock_updated_device
            
            response = client.put(
                '/api/v1/devices/1',
                data=json.dumps(update_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['name'] == 'Updated Device'
            assert data['data']['baud_rate'] == 19200
    
    def test_delete_device_success(self, client):
        """Test successful device deletion"""
        with patch('app.services.device_service.device_service.delete_device') as mock_delete:
            mock_delete.return_value = True
            
            response = client.delete('/api/v1/devices/1')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert 'deleted successfully' in data['message']
    
    def test_delete_device_not_found(self, client):
        """Test device deletion with non-existent ID"""
        with patch('app.services.device_service.device_service.delete_device') as mock_delete:
            mock_delete.return_value = False
            
            response = client.delete('/api/v1/devices/999')
            
            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Device not found' in data['message']
    
    def test_get_device_stats(self, client):
        """Test device statistics endpoint"""
        mock_stats = {
            'total_devices': 5,
            'status_counts': {
                'online': 3,
                'offline': 2,
                'restarted': 0
            },
            'recent_data_count': 150
        }
        
        with patch('app.services.device_service.device_service.get_device_stats') as mock_get_stats:
            mock_get_stats.return_value = mock_stats
            
            response = client.get('/api/v1/devices/stats')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['total_devices'] == 5
            assert data['data']['status_counts']['online'] == 3
