export interface ReportFormData {
  description: string;
  location_address: string; 
  location_lat: number;      
  location_long: number;     
  category: string;          
  images?: File[];  
  subcategory: string;            
}