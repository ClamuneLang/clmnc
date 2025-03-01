# CMake 3.13 needed for -S and -B params in library compilation
cmake_minimum_required(VERSION 3.13)

project(espc)

# Ensure that we can use folders in projects
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

# Set C++17 standard
set_property(GLOBAL PROPERTY CXX_STANDARD 17)

set(PROJECT_COPYRIGHT "2025")
set(PROJECT_COMPANY "The EspressoLang Team")

set(CMAKE_MODULE_PATH cmake)

# Otherwise "??=" would be interpreted as trigraph for "#"
add_compile_options(-Wno-trigraphs)

# Find LLVM (Temporary unnecessary)
# include(FindLLVM)

add_executable(espc src/main.cpp)

include_directories(include)

# Add subdirectories
add_subdirectory(src)
