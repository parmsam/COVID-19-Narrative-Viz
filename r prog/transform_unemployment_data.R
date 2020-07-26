library(tidyverse)
library(lubridate)
library(skimr)

#data source: http://www.hoosierdata.in.gov/dpage.asp?id=58&view_number=2&menu_level=&panel_number=2

df_a <- readr::read_csv("C:/Users/Sam P/Downloads/idwd_data_707.csv") %>% mutate(Date = as.Date(paste(2019, week, 1, sep="-"), "%Y-%U-%u")-2
)
df_b <- readr::read_csv("C:/Users/Sam P/Downloads/idwd_data_738.csv") %>% mutate(Date = as.Date(paste(2020, week, 1, sep="-"), "%Y-%U-%u")-2
)

# df_a
# df_b
# df_a %>% glimpse()
# df_a %>% skimr::skim()
# View(df)

df_c <- df_a %>% full_join(df_b)
View(df_c)
readr::write_csv(df_c, "C:/Users/Sam P/Downloads/idwd_unemployement_init_claims_2019_2020.csv")

