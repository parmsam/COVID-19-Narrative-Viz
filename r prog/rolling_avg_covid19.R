library(tidyverse)
library(zoo)
library(lubridate)

df <- read_csv("~/Downloads/covid_report_county_date_orig.csv")
df %>% glimpse()

df1 <- df %>% arrange(COUNTY_NAME) %>% 
  mutate(pos_rate = COVID_COUNT / COVID_TEST) %>%
  group_by(COUNTY_NAME) %>% 
  mutate(death_03da = zoo::rollmean(COVID_DEATHS, k = 3, fill = NA),
                death_05da = zoo::rollmean(COVID_DEATHS, k = 5, fill = NA),
                death_07da = zoo::rollmean(COVID_DEATHS, k = 7, fill = NA),
                death_15da = zoo::rollmean(COVID_DEATHS, k = 15, fill = NA),
                death_21da = zoo::rollmean(COVID_DEATHS, k = 21, fill = NA)) %>% 
  mutate(test_03da = zoo::rollmean(COVID_TEST, k = 3, fill = NA),
                test_05da = zoo::rollmean(COVID_TEST, k = 5, fill = NA),
                test_07da = zoo::rollmean(COVID_TEST, k = 7, fill = NA),
                test_15da = zoo::rollmean(COVID_TEST, k = 15, fill = NA),
                test_21da = zoo::rollmean(COVID_TEST, k = 21, fill = NA)) %>%
  mutate(case_03da = zoo::rollmean(COVID_COUNT, k = 3, fill = NA),
                case_05da = zoo::rollmean(COVID_COUNT, k = 5, fill = NA),
                case_07da = zoo::rollmean(COVID_COUNT, k = 7, fill = NA),
                case_15da = zoo::rollmean(COVID_COUNT, k = 15, fill = NA),
                case_21da = zoo::rollmean(COVID_COUNT, k = 21, fill = NA)) %>%
  mutate(pos_rate_03da = zoo::rollmean(pos_rate, k = 3, fill = NA),
                pos_rate_05da = zoo::rollmean(pos_rate, k = 5, fill = NA),
                pos_rate_07da = zoo::rollmean(pos_rate, k = 7, fill = NA),
                pos_rate_15da = zoo::rollmean(pos_rate, k = 15, fill = NA),
                pos_rate_21da = zoo::rollmean(pos_rate, k = 21, fill = NA)) %>%
  filter(DATE > as_date("2020-03-02")) %>%
  ungroup() %>% 
  mutate_at(vars(ends_with("da")), round, 1) %>%
  mutate(pos_rate = round(pos_rate, 1))

readr::write_csv(df1,"~/Downloads/covid_report_county_date.csv")

