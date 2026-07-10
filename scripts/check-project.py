#!/usr/bin/env python3
"""
Mindhouse Project Checker
Proje kalite kontrolü ve validasyon
"""

import subprocess
import sys
import os
from datetime import datetime
import time

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header():
    print(f"{Colors.HEADER}{Colors.BOLD}")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    🧠 MINDHOUSE CHECKER 🧠                    ║")
    print("║                   Project Quality Validator                  ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    print(f"{Colors.OKCYAN}🕐 Başlangıç: {datetime.now().strftime('%H:%M:%S')}{Colors.ENDC}")
    print()

def run_command(command, description, critical=True):
    print(f"{Colors.OKBLUE}🔍 {description}...{Colors.ENDC}")
    print(f"   Komut: {command}")
    
    start_time = time.time()
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        duration = time.time() - start_time
        
        if result.returncode == 0:
            print(f"{Colors.OKGREEN}✅ {description} başarılı! ({duration:.2f}s){Colors.ENDC}")
            if result.stdout.strip():
                print(f"   Çıktı: {result.stdout.strip()}")
            return True
        else:
            print(f"{Colors.FAIL}❌ {description} başarısız! ({duration:.2f}s){Colors.ENDC}")
            if result.stderr.strip():
                print(f"   Hata: {result.stderr.strip()}")
            if critical:
                print(f"{Colors.FAIL}💥 Kritik hata! İşlem durduruluyor.{Colors.ENDC}")
                return False
            else:
                print(f"{Colors.WARNING}⚠️  Kritik olmayan hata, devam ediliyor...{Colors.ENDC}")
                return True
                
    except Exception as e:
        print(f"{Colors.FAIL}💥 Komut çalıştırma hatası: {e}{Colors.ENDC}")
        return False

def check_node_modules():
    """Node modules kontrolü"""
    if not os.path.exists("node_modules"):
        print(f"{Colors.WARNING}📦 node_modules bulunamadı, npm install çalıştırılıyor...{Colors.ENDC}")
        return run_command("npm install", "Dependencies yükleniyor", critical=True)
    return True

def main():
    print_header()
    
    # Proje bilgileri
    print(f"{Colors.BOLD}📋 Proje Bilgileri:{Colors.ENDC}")
    print(f"   🏠 Dizin: {os.getcwd()}")
    print(f"   📦 Package.json: {'✅ Var' if os.path.exists('package.json') else '❌ Yok'}")
    print(f"   🔧 Next.js Config: {'✅ Var' if os.path.exists('next.config.js') or os.path.exists('next.config.ts') else '❌ Yok'}")
    print(f"   📝 TypeScript Config: {'✅ Var' if os.path.exists('tsconfig.json') else '❌ Yok'}")
    print()
    
    # Node modules kontrolü
    if not check_node_modules():
        sys.exit(1)
    
    # Test sonuçları
    results = []
    
    # 1. Lint kontrolü
    print(f"\n{Colors.BOLD}🔍 1. Lint Kontrolü{Colors.ENDC}")
    results.append(("Lint", run_command("npx next lint --fix", "ESLint kontrolü ve düzeltme")))
    
    # 2. TypeScript kontrolü
    print(f"\n{Colors.BOLD}🔍 2. TypeScript Kontrolü{Colors.ENDC}")
    results.append(("TypeScript", run_command("npx tsc --noEmit", "TypeScript tip kontrolü")))
    
    # 3. Build kontrolü
    print(f"\n{Colors.BOLD}🔍 3. Build Kontrolü{Colors.ENDC}")
    results.append(("Build", run_command("npm run build", "Production build")))
    
    # Sonuç özeti
    print(f"\n{Colors.BOLD}📊 SONUÇ ÖZETİ{Colors.ENDC}")
    print("╔══════════════════════════════════════════════════════════════╗")
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ BAŞARILI" if passed else "❌ BAŞARISIZ"
        color = Colors.OKGREEN if passed else Colors.FAIL
        print(f"║ {color}{test_name:<15} {status:<15}{Colors.ENDC} ║")
        if not passed:
            all_passed = False
    
    print("╚══════════════════════════════════════════════════════════════╝")
    
    # Final mesaj
    print(f"\n{Colors.BOLD}🎯 FİNAL DURUM{Colors.ENDC}")
    if all_passed:
        print(f"{Colors.OKGREEN}🎉 TEBRİKLER! Tüm kontroller başarılı!{Colors.ENDC}")
        print(f"{Colors.OKGREEN}🚀 Proje production'a hazır!{Colors.ENDC}")
        print(f"{Colors.OKCYAN}⏰ Bitiş: {datetime.now().strftime('%H:%M:%S')}{Colors.ENDC}")
        sys.exit(0)
    else:
        print(f"{Colors.FAIL}💥 Bazı kontroller başarısız! Lütfen hataları düzeltin.{Colors.ENDC}")
        print(f"{Colors.WARNING}🔧 Hataları düzelttikten sonra scripti tekrar çalıştırın.{Colors.ENDC}")
        sys.exit(1)

if __name__ == "__main__":
    main() 