const LOCATION_URL="https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json";
const LOCATION_CACHE_KEY="sholok_bangladesh_locations_v5";
const GROUP_KEY="sholok_delivery_rate_groups_v3";
const CUSTOM_AREA_KEY="sholok_delivery_custom_areas_v5";
const CUSTOM_DISTRICT_KEY="sholok_delivery_custom_districts_v5";
const ASSIGN_KEY="sholok_delivery_assignments_v3";
const AREA_STATUS_KEY="sholok_delivery_area_status_v1";
const AREA_OVERRIDE_KEY="sholok_delivery_area_overrides_v1";
const DISTRICT_RENAME_KEY="sholok_district_renames_v1";
const PROVIDED_LOCATION_DATA=[{"name":"Dhaka","districts":[{"name":"Dhaka","upazilas":[{"name":"Adabor"},{"name":"Agargaon"},{"name":"Ainusbag (Dakshinkhan)"},{"name":"Ashkona"},{"name":"Askona Airport Road"},{"name":"Azimpur"},{"name":"Badda (Middle Badda)"},{"name":"Badda (Merul Badda)"},{"name":"Badda (North Badda)"},{"name":"Badda (South Badda)"},{"name":"Baigertek (Mirpur)"},{"name":"Bailey Road"},{"name":"Banani (Block A)"},{"name":"Banani (Block B to K)"},{"name":"Banani DOHS"},{"name":"Banga Bazar"},{"name":"Bangabandhu Avenue"},{"name":"Bangshal"},{"name":"Baridhara DOHS"},{"name":"Baridhara J-Block"},{"name":"Basabo"},{"name":"Bashundhara R/A (Block A-C)"},{"name":"Bashundhara R/A (Block D-I)"},{"name":"Bashundhara R/A (Block J-N)"},{"name":"Begum Bazar"},{"name":"Bijoynagar"},{"name":"Bongo Bhaban Area"},{"name":"Bosila (Mohammadpur)"},{"name":"Cantonment"},{"name":"Chawkbazar"},{"name":"Chankarpul"},{"name":"Dakshinkhan"},{"name":"Darussalam"},{"name":"Dayaganj"},{"name":"Demra"},{"name":"Dhamrai"},{"name":"Dhania"},{"name":"Dhanmondi (Road 1 to 15)"},{"name":"Dhanmondi (Road 16 to 32)"},{"name":"Dhakeshwari"},{"name":"Dholaikhal"},{"name":"Dholaipar"},{"name":"Dohar"},{"name":"Elephant Road"},{"name":"Eskaton (New Eskaton)"},{"name":"Eskaton (Old Eskaton)"},{"name":"Fakirapul"},{"name":"Farmgate"},{"name":"Fayedabad"},{"name":"Gabtoli"},{"name":"Gendaria"},{"name":"Golartek (Mirpur)"},{"name":"Gudaraghat (Badda)"},{"name":"Gulshan 1"},{"name":"Gulshan 2"},{"name":"Gulistan"},{"name":"Hajipara (Rampura)"},{"name":"Hatirjheel Area"},{"name":"Hazaribagh"},{"name":"High Court Area"},{"name":"Ibrahimpur (Kafrul)"},{"name":"Imamganj"},{"name":"Islampur"},{"name":"Jatrabari"},{"name":"Jhilpar (Shahjadpur)"},{"name":"Jigatola"},{"name":"Jurain"},{"name":"Kafrul"},{"name":"Kajla"},{"name":"Kakrail"},{"name":"Kalabagan"},{"name":"Kallayanpur"},{"name":"Kalshi (Mirpur)"},{"name":"Kamalapur"},{"name":"Kaptan Bazar"},{"name":"Kawla"},{"name":"Kellar Mor (Lalbagh)"},{"name":"Keraniganj (Abdullahpur)"},{"name":"Keraniganj (Hasnabad)"},{"name":"Keraniganj (Jinjira)"},{"name":"Keraniganj (Kadamtoli)"},{"name":"Keraniganj (Rohitpur)"},{"name":"Khilgaon (Block A-C)"},{"name":"Khilgaon (Tazmahal Road)"},{"name":"Khilkhet"},{"name":"Kochukhet"},{"name":"Kotwali"},{"name":"Kuril"},{"name":"Lalbagh"},{"name":"Lalmatia"},{"name":"Laxmibazar"},{"name":"Madartek"},{"name":"Moghbazar"},{"name":"Malibagh"},{"name":"Maniknagar"},{"name":"Matuail"},{"name":"Midford"},{"name":"Middle Para (Khilkhet)"},{"name":"Mirpur 1"},{"name":"Mirpur 2"},{"name":"Mirpur 6"},{"name":"Mirpur 7"},{"name":"Mirpur 10"},{"name":"Mirpur 11"},{"name":"Mirpur 12"},{"name":"Mirpur 13"},{"name":"Mirpur 14"},{"name":"Mirpur DOHS"},{"name":"Mirpur Section 11.5"},{"name":"Mirpur Zoo Road"},{"name":"Mohammadpur (Asad Avenue)"},{"name":"Mohammadpur (Housing)"},{"name":"Mohammadpur (Japan Garden)"},{"name":"Mohammadpur (Town Hall)"},{"name":"Monipur (60-Feet)"},{"name":"Monipuripara"},{"name":"Motijheel"},{"name":"Mouchak"},{"name":"Mugda"},{"name":"Naddapara"},{"name":"Narinda"},{"name":"Naya Bazar"},{"name":"Naya Paltan"},{"name":"Nawabganj"},{"name":"Nawabpur"},{"name":"New Market"},{"name":"Niketon"},{"name":"Nikunja 1"},{"name":"Nikunja 2"},{"name":"Nilkhet"},{"name":"Paikpara (Mirpur)"},{"name":"Palashi"},{"name":"Pallabi"},{"name":"Panthapath"},{"name":"Postogola"},{"name":"Press Club"},{"name":"Purana Paltan"},{"name":"Puran Dhaka (General)"},{"name":"Rajarbagh"},{"name":"Rajendrapur (Keraniganj)"},{"name":"Rampura"},{"name":"Rayer Bazar"},{"name":"Rayerbagh"},{"name":"Rupnagar (Mirpur)"},{"name":"Sabujbagh"},{"name":"Sadarghat"},{"name":"Sayedabad"},{"name":"Sector 1 (Uttara)"},{"name":"Sector 3 (Uttara)"},{"name":"Sector 4 (Uttara)"},{"name":"Sector 5 (Uttara)"},{"name":"Sector 6 (Uttara)"},{"name":"Sector 7 (Uttara)"},{"name":"Sector 9 (Uttara)"},{"name":"Sector 10 (Uttara)"},{"name":"Sector 11 (Uttara)"},{"name":"Sector 12 (Uttara)"},{"name":"Sector 13 (Uttara)"},{"name":"Sector 14 (Uttara)"},{"name":"Shahbagh"},{"name":"Shahjahanpur"},{"name":"Shantinagar"},{"name":"Shere Bangla Nagar"},{"name":"Shewra (Kuril)"},{"name":"Shewrapara (East)"},{"name":"Shewrapara (West)"},{"name":"Shiddheswari"},{"name":"Shonir Akhra"},{"name":"Shyampur"},{"name":"Siddique Bazar"},{"name":"Subidbazar"},{"name":"Sutrapur"},{"name":"Taltola (Agargaon)"},{"name":"Tatibazar"},{"name":"Tejgaon Industrial Area"},{"name":"Tejkunipara"},{"name":"Tikatuly"},{"name":"Tipu Sultan Road"},{"name":"Tolna (Khilkhet)"},{"name":"Uttara Model Town"},{"name":"Uttarkhan"},{"name":"Uttar Para (Khilkhet)"},{"name":"Vasantek"},{"name":"Wari"},{"name":"Zigatola"},{"name":"Ashulia"},{"name":"Birulia"},{"name":"DEPZ (Savar)"},{"name":"Jirabo"},{"name":"Nabinagar"},{"name":"Savar Sadar"},{"name":"Savar Cantonment"}]},{"name":"Gazipur","upazilas":[{"name":"Board Bazar"},{"name":"Chandra"},{"name":"Cherag Ali"},{"name":"Chowrasta"},{"name":"Gacha"},{"name":"Gazipur Sadar"},{"name":"Kaliakair"},{"name":"Kaliganj"},{"name":"Kapasia"},{"name":"Konabari"},{"name":"Mawna"},{"name":"Mouchak"},{"name":"Pubail"},{"name":"Safipur"},{"name":"Shibbari"},{"name":"Sreepur"},{"name":"Tongi (East)"},{"name":"Tongi (West)"}]},{"name":"Narayanganj","upazilas":[{"name":"Araihazar"},{"name":"Bandar"},{"name":"Chashara"},{"name":"Fatullah"},{"name":"Gauchhia"},{"name":"Gopaldi"},{"name":"Kanchpur"},{"name":"Madanpur"},{"name":"Mandalpara"},{"name":"Narayanganj Sadar"},{"name":"Nitaiaganj"},{"name":"Purbachal"},{"name":"Rupganj"},{"name":"Shiddhirganj"},{"name":"Sonargaon"}]},{"name":"Faridpur","upazilas":[{"name":"Alfadanga"},{"name":"Bhanga"},{"name":"Boalmari"},{"name":"Charbhadrasan"},{"name":"Faridpur Sadar"},{"name":"Madhukhali"},{"name":"Nagarkanda"},{"name":"Sadarpur"},{"name":"Saltha"}]},{"name":"Gopalganj","upazilas":[{"name":"Gopalganj Sadar"},{"name":"Kashiani"},{"name":"Kotalipara"},{"name":"Muksudpur"},{"name":"Tungipara"}]},{"name":"Kishoreganj","upazilas":[{"name":"Austagram"},{"name":"Bajitpur"},{"name":"Bhairab"},{"name":"Hossainpur"},{"name":"Itna"},{"name":"Karimganj"},{"name":"Katiadi"},{"name":"Kishoreganj Sadar"},{"name":"Kuliarchar"},{"name":"Mithamain"},{"name":"Nikli"},{"name":"Pakundia"},{"name":"Tarail"}]},{"name":"Madaripur","upazilas":[{"name":"Kalkini"},{"name":"Madaripur Sadar"},{"name":"Rajoir"},{"name":"Shibchar"}]},{"name":"Manikganj","upazilas":[{"name":"Daulatpur"},{"name":"Ghior"},{"name":"Harirampur"},{"name":"Manikganj Sadar"},{"name":"Saturia"},{"name":"Shibalaya"},{"name":"Singair"}]},{"name":"Munshiganj","upazilas":[{"name":"Gajaria"},{"name":"Hasara"},{"name":"Louhajang"},{"name":"Mawa"},{"name":"Muktarpur"},{"name":"Munshiganj Sadar"},{"name":"Sirajdikhan"},{"name":"Sreenagar"},{"name":"Tongibari"}]},{"name":"Narsingdi","upazilas":[{"name":"Belabo"},{"name":"Ghorashal"},{"name":"Madhabdi"},{"name":"Monohardi"},{"name":"Narsingdi Sadar"},{"name":"Palash"},{"name":"Raipura"},{"name":"Shekherchar"},{"name":"Shibpur"}]},{"name":"Rajbari","upazilas":[{"name":"Baliakandi"},{"name":"Goalanda"},{"name":"Kalukhali"},{"name":"Pangsha"},{"name":"Rajbari Sadar"}]},{"name":"Shariatpur","upazilas":[{"name":"Damudya"},{"name":"Gosairhat"},{"name":"Naria"},{"name":"Shariatpur Sadar"},{"name":"Bhedarganj"},{"name":"Zanjira"}]},{"name":"Tangail","upazilas":[{"name":"Basail"},{"name":"Bhuapur"},{"name":"Delduar"},{"name":"Dhanbari"},{"name":"Elenga"},{"name":"Ghatail"},{"name":"Gopalpur"},{"name":"Gorai"},{"name":"Kalihati"},{"name":"Madhupur"},{"name":"Mirzapur"},{"name":"Nagarpur"},{"name":"Sakhipur"},{"name":"Tangail Sadar"}]}]},{"name":"Chattogram","districts":[{"name":"Chattogram","upazilas":[{"name":"Agrabad"},{"name":"Akbar Shah"},{"name":"Anwara"},{"name":"Baizid Bostami"},{"name":"Bakalia"},{"name":"Bandar"},{"name":"Banshkhali"},{"name":"Baraiyarhat"},{"name":"Bhatiari"},{"name":"Boalkhali"},{"name":"Chandanaish"},{"name":"Chandgaon"},{"name":"Chawkbazar"},{"name":"Choudhury Hat"},{"name":"Dewanhart"},{"name":"Dohazari"},{"name":"Double Mooring"},{"name":"EPZ"},{"name":"GEC Circle"},{"name":"Halishahar"},{"name":"Hathazari"},{"name":"Khulshi"},{"name":"Kotwali"},{"name":"Kumira"},{"name":"Lalkhan Bazar"},{"name":"Lohagara"},{"name":"Madarbari"},{"name":"Mirsharai"},{"name":"Nasirabad"},{"name":"Pahartali"},{"name":"Panchlaish"},{"name":"Patenga"},{"name":"Patiya"},{"name":"Rangunia"},{"name":"Raozan"},{"name":"Sandwip"},{"name":"Satkania"},{"name":"Sitakunda"}]},{"name":"Cox's Bazar","upazilas":[{"name":"Chakaria"},{"name":"Cox's Bazar Sadar"},{"name":"Kutubdia"},{"name":"Kolatoli"},{"name":"Link Road"},{"name":"Maheshkhali"},{"name":"Pekua"},{"name":"Ramu"},{"name":"Teknaf"},{"name":"Ukhia"}]},{"name":"Cumilla","upazilas":[{"name":"Barura"},{"name":"Brahmanpara"},{"name":"Burichang"},{"name":"Chandina"},{"name":"Chauddagram"},{"name":"Cumilla EPZ"},{"name":"Cumilla Sadar"},{"name":"Cumilla Sadar South"},{"name":"Daudkandi"},{"name":"Debidwar"},{"name":"Homna"},{"name":"Kandirpar"},{"name":"Laksam"},{"name":"Meghna"},{"name":"Monohargonj"},{"name":"Muradnagar"},{"name":"Nangalkot"},{"name":"Paduar Bazar"},{"name":"Shasongachha"},{"name":"Titas"}]},{"name":"Bandarban","upazilas":[{"name":"Alikadam"},{"name":"Bandarban Sadar"},{"name":"Lama"}]},{"name":"Brahmanbaria","upazilas":[{"name":"Akhaura"},{"name":"Ashuganj"},{"name":"Bancharampur"},{"name":"Bijoynagar"},{"name":"Brahmanbaria Sadar"},{"name":"Kasba"},{"name":"Nabinagar"},{"name":"Nasirnagar"},{"name":"Sarail"}]},{"name":"Chandpur","upazilas":[{"name":"Chandpur Sadar"},{"name":"Faridganj"},{"name":"Haimchar"},{"name":"Hajiganj"},{"name":"Kachua"},{"name":"Matlab North"},{"name":"Matlab South"},{"name":"Puranbazar"},{"name":"Shahrasti"}]},{"name":"Feni","upazilas":[{"name":"Chhagalnaiya"},{"name":"Daganbhuiyan"},{"name":"Feni Sadar"},{"name":"Fulgazi"},{"name":"Parshuram"},{"name":"Sonagazi"},{"name":"Trunk Road"}]},{"name":"Khagrachhari","upazilas":[{"name":"Khagrachhari Sadar"},{"name":"Matiranga"},{"name":"Ramgarh"}]},{"name":"Lakshmipur","upazilas":[{"name":"Kamalnagar"},{"name":"Lakshmipur Sadar"},{"name":"Ramganj"},{"name":"Ramgati"},{"name":"Raipur"}]},{"name":"Noakhali","upazilas":[{"name":"Begumganj (Chowmuhani)"},{"name":"Bosurhat"},{"name":"Chatkhil"},{"name":"Companiganj"},{"name":"Hatiya"},{"name":"Kabirhat"},{"name":"Maijdee (Noakhali Sadar)"},{"name":"Senbagh"},{"name":"Sonaimuri"},{"name":"Subarnachar"}]},{"name":"Rangamati","upazilas":[{"name":"Kaptai"},{"name":"Kaukhali"},{"name":"Rangamati Sadar"}]}]},{"name":"Rajshahi","districts":[{"name":"Bogra","upazilas":[{"name":"Adamdighi"},{"name":"Banani (Bogra)"},{"name":"Bogra Sadar"},{"name":"Dhunat"},{"name":"Dupchanchia"},{"name":"Gabtoli"},{"name":"Joleshoritola"},{"name":"Kahaloo"},{"name":"Nandigram"},{"name":"Santahar"},{"name":"Sariakandi"},{"name":"Satmatha"},{"name":"Shajahanpur"},{"name":"Sherpur"},{"name":"Shibganj"},{"name":"Sonatala"}]},{"name":"Chapainawabganj","upazilas":[{"name":"Bholahat"},{"name":"Chapainawabganj Sadar"},{"name":"Gomastapur"},{"name":"Kansat"},{"name":"Nachole"},{"name":"Shibganj"}]},{"name":"Joypurhat","upazilas":[{"name":"Akkelpur"},{"name":"Joypurhat Sadar"},{"name":"Kalai"},{"name":"Khetlal"},{"name":"Panchbibi"}]},{"name":"Naogaon","upazilas":[{"name":"Atrai"},{"name":"Badalgachhi"},{"name":"Dhamoirhat"},{"name":"Mahadevpur"},{"name":"Manda"},{"name":"Naogaon Sadar"},{"name":"Niamatpur"},{"name":"Patnitala"},{"name":"Porsha"},{"name":"Raninagar"},{"name":"Sapahar"}]},{"name":"Natore","upazilas":[{"name":"Bagatipara"},{"name":"Baraigram"},{"name":"Bonpara"},{"name":"Gurudaspur"},{"name":"Lalpur"},{"name":"Naldanga"},{"name":"Natore Sadar"},{"name":"Singra"}]},{"name":"Pabna","upazilas":[{"name":"Atgharia"},{"name":"Bera"},{"name":"Bhangoora"},{"name":"Chatmohar"},{"name":"Faridpur"},{"name":"Ishwardi"},{"name":"Pabna Sadar"},{"name":"Rooppur"},{"name":"Santhia"},{"name":"Sujanagar"}]},{"name":"Rajshahi","upazilas":[{"name":"Bagha"},{"name":"Bagmara"},{"name":"Bhabaniganj"},{"name":"Binodpur"},{"name":"Charghat"},{"name":"Durgapur"},{"name":"Godagari"},{"name":"Kazla"},{"name":"Mohanpur"},{"name":"New Market (Rajshahi)"},{"name":"Paba"},{"name":"Puthia"},{"name":"Rajshahi City Center"},{"name":"Saheb Bazar"},{"name":"Tanore"},{"name":"Uposhahar"}]},{"name":"Sirajganj","upazilas":[{"name":"Belkuchi"},{"name":"Chouhali"},{"name":"Enayetpur"},{"name":"Kamarkhanda"},{"name":"Kazipur"},{"name":"Raiganj"},{"name":"Shahjadpur"},{"name":"Sirajganj Sadar"},{"name":"Tarash"},{"name":"Ullahpara"}]}]},{"name":"Khulna","districts":[{"name":"Bagerhat","upazilas":[{"name":"Bagerhat Sadar"},{"name":"Chitalmari"},{"name":"Fakirhat"},{"name":"Kachua"},{"name":"Mollahat"},{"name":"Mongla"},{"name":"Morrelganj"},{"name":"Rampal"},{"name":"Sharankhola"}]},{"name":"Chuadanga","upazilas":[{"name":"Alamdanga"},{"name":"Chuadanga Sadar"},{"name":"Damurhuda"},{"name":"Darshana"},{"name":"Jibannagar"}]},{"name":"Jashore","upazilas":[{"name":"Abhaynagar (Nawapara)"},{"name":"Bagherpara"},{"name":"Benapole"},{"name":"Chanchra"},{"name":"Chaugachha"},{"name":"Jashore Sadar"},{"name":"Jhikargachha"},{"name":"Keshabpur"},{"name":"Manirampur"},{"name":"Palbari"},{"name":"Sharsha"}]},{"name":"Jhenaidah","upazilas":[{"name":"Harinakunda"},{"name":"Jhenaidah Sadar"},{"name":"Kaliganj"},{"name":"Kotchandpur"},{"name":"Maheshpur"},{"name":"Shailkupa"}]},{"name":"Khulna","upazilas":[{"name":"Batiaghata"},{"name":"Boyra"},{"name":"Chalna"},{"name":"Dacope"},{"name":"Dighalia"},{"name":"Daulatpur"},{"name":"Dumuria"},{"name":"Khalishpur"},{"name":"Khulna City Center"},{"name":"Koyra"},{"name":"Paikgachha"},{"name":"Phultala"},{"name":"Rupsha"},{"name":"Shibbari"},{"name":"Terokhada"}]},{"name":"Kushtia","upazilas":[{"name":"Bheramara"},{"name":"Chourhas"},{"name":"Daulatpur"},{"name":"Khoksa"},{"name":"Kumarkhali"},{"name":"Kushtia Sadar"},{"name":"Mirpur"}]},{"name":"Magura","upazilas":[{"name":"Magura Sadar"},{"name":"Mohammadpur"},{"name":"Shalikha"},{"name":"Sreepur"}]},{"name":"Meherpur","upazilas":[{"name":"Gangni"},{"name":"Meherpur Sadar"},{"name":"Mujibnagar"}]},{"name":"Narail","upazilas":[{"name":"Kalia"},{"name":"Lohagara"},{"name":"Narail Sadar"}]},{"name":"Satkhira","upazilas":[{"name":"Assasuni"},{"name":"Debhata"},{"name":"Kalaroa"},{"name":"Kaliganj"},{"name":"Satkhira Sadar"},{"name":"Shyamnagar"},{"name":"Tala"}]}]},{"name":"Sylhet","districts":[{"name":"Habiganj","upazilas":[{"name":"Ajmiriganj"},{"name":"Bahubal"},{"name":"Baniyachong"},{"name":"Chunarughat"},{"name":"Habiganj Sadar"},{"name":"Lakhai"},{"name":"Madhabpur"},{"name":"Nabiganj"},{"name":"Shayestaganj"}]},{"name":"Moulvibazar","upazilas":[{"name":"Barlekha"},{"name":"Juri"},{"name":"Kamalganj"},{"name":"Kulaura"},{"name":"Moulvibazar Sadar"},{"name":"Rajnagar"},{"name":"Sreemangal"}]},{"name":"Sunamganj","upazilas":[{"name":"Chhatak"},{"name":"Dharmapasha"},{"name":"Dowarabazar"},{"name":"Jagannathpur"},{"name":"Jamalganj"},{"name":"Shalai"},{"name":"South Sunamganj"},{"name":"Sunamganj Sadar"},{"name":"Tahirpur"}]},{"name":"Sylhet","upazilas":[{"name":"Balaganj"},{"name":"Beani Bazar"},{"name":"Bishwanath"},{"name":"Chowhatta"},{"name":"Companiganj"},{"name":"Fenchuganj"},{"name":"Golapganj"},{"name":"Gowainghat"},{"name":"Jaintiapur"},{"name":"Jindabazar"},{"name":"Kanaighat"},{"name":"Osmani Nagar"},{"name":"South Surma"},{"name":"Sylhet City Center"},{"name":"Tilagarh"},{"name":"Uposhahar"},{"name":"Zakiganj"}]}]},{"name":"Barishal","districts":[{"name":"Barguna","upazilas":[{"name":"Amtali"},{"name":"Bamna"},{"name":"Barguna Sadar"},{"name":"Betagi"},{"name":"Patharghata"},{"name":"Taltali"}]},{"name":"Barishal","upazilas":[{"name":"Agailjhara"},{"name":"Babuganj"},{"name":"Bakerganj"},{"name":"Banaripara"},{"name":"Barishal City Center"},{"name":"Gournadi"},{"name":"Hijla"},{"name":"Mehendiganj"},{"name":"Muladi"},{"name":"Nathullabad"},{"name":"Rupatali"},{"name":"Uzirpur"}]},{"name":"Bhola","upazilas":[{"name":"Baborhanuddin"},{"name":"Bhola Sadar"},{"name":"Char Fasson"},{"name":"Daulatkhan"},{"name":"Lalmohan"},{"name":"Manpura"},{"name":"Tazumuddin"}]},{"name":"Jhalokathi","upazilas":[{"name":"Jhalokathi Sadar"},{"name":"Kathalia"},{"name":"Nalchity"},{"name":"Rajapur"}]},{"name":"Patuakhali","upazilas":[{"name":"Bauphal"},{"name":"Dashmina"},{"name":"Dumki"},{"name":"Galachipa"},{"name":"Kalapara (Kuakata)"},{"name":"Mirzaganj"},{"name":"Patuakhali Sadar"},{"name":"Rangabali"}]},{"name":"Pirojpur","upazilas":[{"name":"Bhandaria"},{"name":"Kawkhali"},{"name":"Mathbaria"},{"name":"Nazirpur"},{"name":"Nesarabad (Swarupkathi)"},{"name":"Pirojpur Sadar"},{"name":"Zianagar"}]}]},{"name":"Rangpur","districts":[{"name":"Dinajpur","upazilas":[{"name":"Biral"},{"name":"Birampur"},{"name":"Birganj"},{"name":"Bochaganj"},{"name":"Chirirbandar"},{"name":"Dinajpur Sadar"},{"name":"Ghoraghat"},{"name":"Hakimpur (Hili)"},{"name":"Kaharole"},{"name":"Khansama"},{"name":"Nawabganj"},{"name":"Parbatipur"},{"name":"Phulbari"}]},{"name":"Gaibandha","upazilas":[{"name":"Fulchhari"},{"name":"Gaibandha Sadar"},{"name":"Gobindaganj"},{"name":"Palashbari"},{"name":"Sadullapur"},{"name":"Saghata"},{"name":"Sundarganj"}]},{"name":"Kurigram","upazilas":[{"name":"Bhurungamari"},{"name":"Char Rajibpur"},{"name":"Chilmari"},{"name":"Kurigram Sadar"},{"name":"Nageshwari"},{"name":"Phulbari"},{"name":"Rajarhat"},{"name":"Roumari"},{"name":"Ulipur"}]},{"name":"Lalmonirhat","upazilas":[{"name":"Aditmari"},{"name":"Burimari"},{"name":"Hatibandha"},{"name":"Kaliganj"},{"name":"Lalmonirhat Sadar"},{"name":"Patgram"}]},{"name":"Nilphamari","upazilas":[{"name":"Dimla"},{"name":"Domar"},{"name":"Jaldhaka"},{"name":"Kishoreganj"},{"name":"Nilphamari Sadar"},{"name":"Saidpur"}]},{"name":"Panchagarh","upazilas":[{"name":"Atwari"},{"name":"Banglabandha"},{"name":"Boda"},{"name":"Debiganj"},{"name":"Panchagarh Sadar"},{"name":"Tetulia"}]},{"name":"Rangpur","upazilas":[{"name":"Badarganj"},{"name":"Gangachhara"},{"name":"Kaunia"},{"name":"Lalbagh (Rangpur)"},{"name":"Mithapukur"},{"name":"Pirgachha"},{"name":"Pirganj"},{"name":"Rangpur City Center"},{"name":"Shapla Chottor"},{"name":"Taraganj"}]},{"name":"Thakurgaon","upazilas":[{"name":"Baliadangi"},{"name":"Haripur"},{"name":"Pirganj"},{"name":"Ranisankail"},{"name":"Thakurgaon Sadar"}]}]},{"name":"Mymensingh","districts":[{"name":"Jamalpur","upazilas":[{"name":"Baksiganj"},{"name":"Dewanganj"},{"name":"Islampur"},{"name":"Jamalpur Sadar"},{"name":"Madarganj"},{"name":"Melandohn"},{"name":"Sarishabari"}]},{"name":"Mymensingh","upazilas":[{"name":"Dhobaura"},{"name":"Fulbaria"},{"name":"Gafargaon"},{"name":"Ganginar Paar"},{"name":"Gauripur"},{"name":"Haluaghat"},{"name":"Ishwarganj"},{"name":"Maskanda"},{"name":"Muktagachha"},{"name":"Mymensingh Sadar"},{"name":"Nandail"},{"name":"Phulpur"},{"name":"Seedstore"},{"name":"Square Masterbari"},{"name":"Tarakanda"},{"name":"Town Hall Area"},{"name":"Trishal"},{"name":"Bhaluka"}]},{"name":"Netrokona","upazilas":[{"name":"Atpara"},{"name":"Barhatta"},{"name":"Durgapur"},{"name":"Kalmakanda"},{"name":"Kendua"},{"name":"Khaliajuri"},{"name":"Madan"},{"name":"Mohanganj"},{"name":"Netrokona Sadar"},{"name":"Purbadhala"}]},{"name":"Sherpur","upazilas":[{"name":"Jhenaigati"},{"name":"Nakla"},{"name":"Nalitabari"},{"name":"Sherpur Sadar"},{"name":"Sreebardi"}]}]}];

let locations=[];
const DIVISION_ORDER=["Dhaka","Chattogram","Rajshahi","Khulna","Barishal","Sylhet","Rangpur","Mymensingh"];
const DISTRICT_ORDER={
  Dhaka:["Dhaka","Faridpur","Gazipur","Gopalganj","Kishoreganj","Madaripur","Manikganj","Munshiganj","Narayanganj","Narsingdi","Rajbari","Shariatpur","Tangail"],
  Chattogram:["Bandarban","Brahmanbaria","Chandpur","Chattogram","Cumilla","Cox's Bazar","Feni","Khagrachhari","Lakshmipur","Noakhali","Rangamati"],
  Rajshahi:["Bogura","Joypurhat","Naogaon","Natore","Chapainawabganj","Pabna","Rajshahi","Sirajganj"],
  Khulna:["Bagerhat","Chuadanga","Jashore","Jhenaidah","Khulna","Kushtia","Magura","Meherpur","Narail","Satkhira"],
  Barishal:["Barguna","Barishal","Bhola","Jhalokathi","Patuakhali","Pirojpur"],
  Sylhet:["Habiganj","Moulvibazar","Sunamganj","Sylhet"],
  Rangpur:["Dinajpur","Gaibandha","Kurigram","Lalmonirhat","Nilphamari","Panchagarh","Rangpur","Thakurgaon"],
  Mymensingh:["Jamalpur","Mymensingh","Netrokona","Sherpur"]
};
function orderDivisions(data){
  const rank=new Map(DIVISION_ORDER.map((name,i)=>[name,i]));
  return [...data].sort((a,b)=>(rank.get(a.name)??999)-(rank.get(b.name)??999)).map(division=>{
    const order=DISTRICT_ORDER[division.name]||[];
    const districtRank=new Map(order.map((name,i)=>[name,i]));
    return {...division,districts:[...(division.districts||[])].sort((a,b)=>(districtRank.get(a.name)??999)-(districtRank.get(b.name)??999))};
  });
}
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
let groups=readJSON(GROUP_KEY,{});
let customAreas=readJSON(CUSTOM_AREA_KEY,[]);
let customDistricts=readJSON(CUSTOM_DISTRICT_KEY,[]);
let assignments=readJSON(ASSIGN_KEY,{});
let areaStatuses=readJSON(AREA_STATUS_KEY,{});
let areaOverrides=readJSON(AREA_OVERRIDE_KEY,{});
let districtRenames=readJSON(DISTRICT_RENAME_KEY,{});

const $=id=>document.getElementById(id);

// FIX #4: save() now returns a boolean; callers check the result
const save=()=>{
  try{
    localStorage.setItem(GROUP_KEY,JSON.stringify(groups));
    localStorage.setItem(CUSTOM_AREA_KEY,JSON.stringify(customAreas));
    localStorage.setItem(CUSTOM_DISTRICT_KEY,JSON.stringify(customDistricts));
    localStorage.setItem(ASSIGN_KEY,JSON.stringify(assignments));
    localStorage.setItem(AREA_STATUS_KEY,JSON.stringify(areaStatuses));
    localStorage.setItem(AREA_OVERRIDE_KEY,JSON.stringify(areaOverrides));
    localStorage.setItem(DISTRICT_RENAME_KEY,JSON.stringify(districtRenames));
    return true;
  }catch(e){
    console.error('[Sholok] localStorage save failed:',e);
    return false;
  }
};

const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const fmt=n=>Number(n||0).toLocaleString("en-BD");
const toast=(s,type)=>{
  const t=$("toast");
  if(!t)return;
  t.textContent=s;
  t.className='toast show'+(type==='error'?' error':'');
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.classList.remove("show"),type==='error'?4000:2200);
};
const key=(store,div,district,area)=>`${store}||${div}||${district}||${area}`;

// ── District rename helpers ──────────────────────────────────────────────────
// Returns the ORIGINAL district name from locations data, given a possibly-renamed current name
function getOriginalDistrictName(division,currentName){
  for(const [k,v] of Object.entries(districtRenames)){
    const sep=k.indexOf("||");if(sep<0)continue;
    if(k.slice(0,sep)===division&&v===currentName)return k.slice(sep+2);
  }
  return currentName;
}
// Returns the current (possibly renamed) display name for an original district
function getCurrentDistrictName(division,originalName){
  return districtRenames[`${division}||${originalName}`]||originalName;
}

// FIX #1 + #3: defaultAreas() NEVER changes division/district from the original data.
// Only the zone/area NAME can be customised via areaOverrides.
// District display names follow districtRenames.
function defaultAreas(){
  const out=[];
  locations.forEach(d=>d.districts?.forEach(c=>c.upazilas?.forEach(z=>{
    const id=`D-${d.name}-${c.name}-${z.name}`;
    const override=areaOverrides[id];
    const displayDistrict=getCurrentDistrictName(d.name,c.name);
    // Only the area (zone) name can be overridden; division/district are always original
    const areaName=(override&&typeof override.area==='string'&&override.area.trim())?override.area.trim():z.name;
    out.push({id,division:d.name,district:displayDistrict,_origDistrict:c.name,area:areaName,source:'Default'});
  })));
  return out;
}
function savedDeliveryAreas(){
  return [...defaultAreas().map(a=>({...a,source:"Saved"})),...customAreas.map(a=>({...a,source:"Saved"}))];
}
function allAreas(){return savedDeliveryAreas()}
function areaStatus(id){return areaStatuses[id]===false?"Disable":"Enable"}
function setAreaStatus(id,value){
  areaStatuses[id]=value==="Enable";
  if(!save())return toast('Status change could not be saved — storage error.','error');
  renderAreaTable();renderZoneList();updateStats();
  toast(`Delivery Area status changed to ${value}.`);
}
function divisionOptions(includeAll=false){
  return (includeAll?`<option value="*">All Divisions</option>`:"")+locations.map((d,i)=>`<option value="${i}">${esc(d.name)}</option>`).join("");
}
function setDivisionSelect(id,all=false){$(id).innerHTML=divisionOptions(all)}

// FIX: districtRecordsForDivision returns current (possibly renamed) district names
function districtRecordsForDivision(divValue,all=false){
  const out=[];
  if(divValue==="*"){
    locations.forEach((division,di)=>(division.districts||[]).forEach((d,ci)=>{
      const displayName=getCurrentDistrictName(division.name,d.name);
      out.push({name:displayName,originalName:d.name,division:division.name,value:`d:${di}|${ci}`,custom:false});
    }));
    customDistricts.forEach(d=>out.push({name:d.name,division:d.division,value:`c:${d.id}`,custom:true,id:d.id}));
  }else{
    const di=Number(divValue),division=locations[di];
    (division?.districts||[]).forEach((d,ci)=>{
      const displayName=getCurrentDistrictName(division.name,d.name);
      out.push({name:displayName,originalName:d.name,division:division.name,value:`d:${di}|${ci}`,custom:false});
    });
    customDistricts.filter(d=>d.division===division?.name).forEach(d=>out.push({name:d.name,division:d.division,value:`c:${d.id}`,custom:true,id:d.id}));
  }
  return out;
}
function fillDistrictSelect(id,divValue,all=false){
  const ds=districtRecordsForDivision(divValue,all);
  $(id).innerHTML=(all?`<option value="*">All Districts</option>`:"")+ds.map(x=>`<option value="${esc(x.value)}">${esc(x.name)}${divValue==="*"?" — "+esc(x.division):""}</option>`).join("");
}
// FIX: getDistrictRecord returns the current (renamed) district name
function getDistrictRecord(value){
  if(!value||value==="*") return null;
  if(value.startsWith("c:")){const id=value.slice(2),x=customDistricts.find(d=>d.id===id);return x?{...x,custom:true,value}:null;}
  if(value.startsWith("d:")){
    const [di,ci]=value.slice(2).split("|").map(Number);
    const d=locations[di]?.districts?.[ci];
    if(!d)return null;
    const originalName=d.name;
    const divisionName=locations[di].name;
    const displayName=getCurrentDistrictName(divisionName,originalName);
    return {name:displayName,originalName,division:divisionName,di,ci,custom:false,value};
  }
  return null;
}
function getDivisionName(v){return v==="*"?"All Divisions":locations[+v]?.name||""}
function storeOptions(selected="",includeAll=false){
  return (includeAll?`<option value="">All Store Locations</option>`:"")+locations.map(d=>`<option value="${esc(d.name)}" ${d.name===selected?"selected":""}>${esc(d.name)}</option>`).join("");
}

async function init(){
  let data=null;
  try{
    const res=await fetch(LOCATION_URL,{cache:"no-store"});
    if(!res.ok) throw Error("Location request failed");
    const remote=await res.json();
    if(Array.isArray(remote)&&remote.length===8){
      const districtCount=remote.reduce((n,d)=>n+(Array.isArray(d.districts)?d.districts.length:0),0);
      const areaCount=remote.reduce((n,d)=>n+(d.districts||[]).reduce((m,c)=>m+(Array.isArray(c.upazilas)?c.upazilas.length:0),0),0);
      if(districtCount===64&&areaCount===763)data=remote;
    }
  }catch(e){}
  if(!data)data=PROVIDED_LOCATION_DATA;
  const districtCount=data.reduce((n,d)=>n+(Array.isArray(d.districts)?d.districts.length:0),0);
  const areaCount=data.reduce((n,d)=>n+(d.districts||[]).reduce((m,c)=>m+(Array.isArray(c.upazilas)?c.upazilas.length:0),0),0);
  if(data.length!==8||districtCount!==64||areaCount!==763){
    const el=$("zoneList");if(el)el.innerHTML='<div class="empty">Bangladesh location data could not be loaded.</div>';
    return;
  }
  locations=orderDivisions(data);
  localStorage.setItem(LOCATION_CACHE_KEY,JSON.stringify(locations));
  setupSelects();renderAll();updateStats();
}
function setupSelects(){
  setDivisionSelect("areaDivision");
  setDivisionSelect("areaFilterDivision",true);
  setDivisionSelect("assignDivision",true);
  const gs=$("groupStore");if(gs)gs.innerHTML=storeOptions();
  const as=$("assignStore");if(as)as.innerHTML=storeOptions();
  const af=$("assignedStoreFilter");if(af)af.innerHTML=storeOptions("",true);

  fillDistrictSelect("areaDistrict",$("areaDivision").value);
  fillDistrictSelect("areaFilterDistrict",$("areaFilterDivision").value,true);
  fillDistrictSelect("assignDistrict",$("assignDivision").value,true);

  $("areaDivision").onchange=()=>fillDistrictSelect("areaDistrict",$("areaDivision").value);
  $("areaFilterDivision").onchange=()=>{fillDistrictSelect("areaFilterDistrict",$("areaFilterDivision").value,true);renderAreaTable();updateRenameBtn();};
  $("areaFilterDistrict").onchange=()=>{renderAreaTable();updateRenameBtn();};
  $("assignDivision").onchange=()=>{fillDistrictSelect("assignDistrict",$("assignDivision").value,true);renderZoneList();};
  $("assignDistrict").onchange=renderZoneList;
  $("assignStore").onchange=renderZoneList;
  const gss=$("groupStore");if(gss)gss.onchange=()=>{};
  const afs=$("assignedStoreFilter");if(afs)afs.onchange=renderAssignments;
  const agf=$("assignedGroupFilter");if(agf)agf.onchange=renderAssignments;
}
function renderAll(){renderAreaTable();renderGroups();renderAssignmentControls();renderZoneList();renderAssignments();}
function updateStats(){
  const dc=$("districtsCount");if(dc)dc.textContent=locations.reduce((n,d)=>n+(d.districts||[]).length,0)+customDistricts.length;
  const ac=$("areasCount");if(ac)ac.textContent=defaultAreas().length+customAreas.length;
  const gc=$("groupsCount");if(gc)gc.textContent=Object.keys(groups).length;
}

// ── Rename District ──────────────────────────────────────────────────────────
function updateRenameBtn(){
  const btn=$("renameDistrictBtn");if(!btn)return;
  const di=$("areaFilterDistrict")?.value;
  const dv=$("areaFilterDivision")?.value;
  btn.style.display=(di&&di!=="*"&&dv&&dv!=="*")?"inline-flex":"none";
}
function startRenameDistrict(){
  const di=$("areaFilterDistrict")?.value;
  const dv=$("areaFilterDivision")?.value;
  if(!di||di==="*"||!dv||dv==="*")return toast("Select a specific division and district first.");
  const dc=getDistrictRecord(di);
  if(!dc)return;
  const division=getDivisionName(dv);
  const currentName=dc.name;
  const newName=(prompt(`Rename district "${currentName}" in ${division} division:\n\nEnter new name:`)||"").trim();
  if(!newName)return;
  if(newName===currentName)return toast("Name unchanged.");
  if(newName.length>80)return toast("District name too long (max 80 characters).");
  // Check collision against other current district names in this division
  const existing=districtRecordsForDivision(dv).map(x=>x.name.toLowerCase());
  if(existing.includes(newName.toLowerCase())&&newName.toLowerCase()!==currentName.toLowerCase())
    return toast(`A district named "${newName}" already exists in ${division}.`);
  renameDistrict(division,currentName,newName);
}
function renameDistrict(division,currentName,newName){
  // Find the original (pre-rename) name in locations data
  const origName=getOriginalDistrictName(division,currentName);
  // Store rename: division||originalName → newName
  districtRenames[`${division}||${origName}`]=newName;
  // Update custom areas under this district
  customAreas=customAreas.map(a=>a.division===division&&a.district===currentName?{...a,district:newName}:a);
  // Update custom district record if one exists
  const cd=customDistricts.find(d=>d.division===division&&d.name===currentName);
  if(cd)cd.name=newName;
  // Update assignment display names
  Object.values(assignments).forEach(a=>{if(a.division===division&&a.district===currentName)a.district=newName;});
  if(!save())return toast('Rename saved in memory but could not persist to storage.','error');
  // Refresh dropdowns to show new name
  fillDistrictSelect("areaFilterDistrict",$("areaFilterDivision").value,true);
  fillDistrictSelect("assignDistrict",$("assignDivision").value,true);
  renderAll();updateStats();updateRenameBtn();
  toast(`District renamed from "${currentName}" to "${newName}". All ${division} areas updated.`);
}

// ── Area form ────────────────────────────────────────────────────────────────
function openAreaForm(id){
  const form=$("areaForm");if(!form)return;
  form.classList.remove("hidden");
  form.dataset.edit=id||"";
  const isDefault=id&&!id.startsWith('C-');
  if(id){
    const a=allAreas().find(x=>x.id===id);
    if(!a){form.classList.add("hidden");return;}
    const di=locations.findIndex(x=>x.name===a.division);
    $("areaDivision").value=di>=0?di:0;
    fillDistrictSelect("areaDistrict",String(di>=0?di:0));
    // Find district by original name for default areas
    const origDistrict=a._origDistrict||a.district;
    const d=locations[di>=0?di:0]?.districts?.findIndex(x=>x.name===origDistrict);
    const cd=customDistricts.find(x=>x.division===a.division&&x.name===a.district);
    $("areaDistrict").value=d>=0?`d:${di}|${d}`:(cd?`c:${cd.id}`:"");
    $("areaDistrictInput").value="";
    $("areaName").value=a.area;
  }else{
    $("areaDistrictInput").value="";
    $("areaName").value="";
  }
  // FIX #1: Lock division/district for built-in areas — only the zone name is editable
  const divEl=$("areaDivision"),distEl=$("areaDistrict"),distInput=$("areaDistrictInput");
  if(divEl)divEl.disabled=!!isDefault;
  if(distEl)distEl.disabled=!!isDefault;
  if(distInput){distInput.disabled=!!isDefault;distInput.placeholder=isDefault?'(locked — built-in area)':'Or enter a custom district';}
  $("areaName").focus();
}
function closeAreaForm(){
  const form=$("areaForm");if(!form)return;
  form.classList.add("hidden");form.dataset.edit="";
  // Always re-enable fields for the next open
  const divEl=$("areaDivision"),distEl=$("areaDistrict"),distInput=$("areaDistrictInput");
  if(divEl)divEl.disabled=false;
  if(distEl)distEl.disabled=false;
  if(distInput){distInput.disabled=false;distInput.placeholder='Or enter a custom district';}
}

// FIX #1: saveArea only allows area-name override for default areas
function saveArea(){
  const divEl=$("areaDivision"),distEl=$("areaDistrict"),distInput=$("areaDistrictInput"),nameEl=$("areaName"),form=$("areaForm");
  const div=locations[+divEl.value]?.name;
  const selected=getDistrictRecord(distEl.value);
  const customDistrictName=(distInput.value||"").trim();
  const district=(customDistrictName||selected?.name||"").trim();
  const area=(nameEl.value||"").trim();
  const edit=form.dataset.edit||"";
  if(!div||!district||!area)return toast('Select a division and district, or enter a custom district, then enter an area name.');
  if(area.length>120)return toast('Area name too long (max 120 characters).');
  const isDefaultEdit=edit&&!edit.startsWith('C-');
  if(customDistrictName&&!isDefaultEdit&&!customDistricts.some(d=>d.division===div&&d.name.toLowerCase()===customDistrictName.toLowerCase()))
    customDistricts.push({id:'CD-'+Date.now(),division:div,name:customDistrictName});
  // Duplicate check: compare within the same division+district
  const checkDiv=isDefaultEdit?(defaultAreas().find(x=>x.id===edit)?.division||div):div;
  const checkDist=isDefaultEdit?(defaultAreas().find(x=>x.id===edit)?.district||district):district;
  const duplicate=allAreas().some(a=>a.division===checkDiv&&a.district===checkDist&&a.area.toLowerCase()===area.toLowerCase()&&a.id!==edit);
  if(duplicate)return toast('This delivery area already exists.');
  if(edit){
    const customIndex=customAreas.findIndex(x=>x.id===edit);
    if(customIndex>=0){
      // Custom area: allow full edit
      Object.entries(assignments).forEach(([oldKey,a])=>{
        if(a.areaId!==edit)return;
        const newKey=assignmentKey(a.store,edit);
        if(oldKey!==newKey){delete assignments[oldKey];}
        assignments[newKey]={...a,key:newKey,division:div,district,area};
      });
      customAreas[customIndex]={...customAreas[customIndex],id:edit,division:div,district,area,source:'Saved'};
    }else{
      // Default area: ONLY save the area name override; division/district are immutable
      const origArea=defaultAreas().find(x=>x.id===edit);
      if(origArea){
        areaOverrides[edit]={area}; // Only area name
        // Update existing assignments' area name
        Object.entries(assignments).forEach(([k,a])=>{if(a.areaId===edit)assignments[k]={...a,area};});
      }
    }
  }else{
    customAreas.push({id:'C-'+Date.now(),division:div,district,area,source:'Saved'});
  }
  if(!save())return toast('Area saved in memory but could not persist to storage. Storage may be full.','error');
  renderAll();updateStats();closeAreaForm();
  toast(edit?`Delivery area updated to "${area}".`:`Delivery area "${area}" saved.`);
}
function removeArea(id){
  const a=customAreas.find(x=>x.id===id);if(!a)return;
  if(!confirm(`Remove custom area "${a.area}"? This cannot be undone.`))return;
  Object.keys(assignments).forEach(k=>{if(assignments[k].areaId===id)delete assignments[k];});
  customAreas=customAreas.filter(x=>x.id!==id);
  if(!save())toast('Remove saved in memory but could not persist to storage.','error');
  renderAll();updateStats();toast(`"${a.area}" removed.`);
}

// FIX #2: renderAreaTable with error boundary, null-safe search, Custom badges
function renderAreaTable(){
  const tableEl=$("areaTable");if(!tableEl)return;
  try{
    const rawQ=String(($("areaSearch")||{value:""}).value||"");
    const q=rawQ.trim().toLowerCase();
    const dv=($("areaFilterDivision")||{value:"*"}).value;
    const di=($("areaFilterDistrict")||{value:"*"}).value;
    const rows=allAreas().filter(a=>{
      try{
        if(q){
          const haystack=`${a.division||""} ${a.district||""} ${a.area||""}`.toLowerCase();
          if(!haystack.includes(q))return false;
        }
        if(dv!=="*"&&(a.division||"")!==getDivisionName(dv))return false;
        if(di!=="*"&&di){
          const dc=getDistrictRecord(di);
          if(!dc)return false;
          if((a.district||"")!==dc.name||(a.division||"")!==dc.division)return false;
        }
        return true;
      }catch(err){console.warn('[Sholok] area filter error:',err,a);return false;}
    });
    if(!rows.length){
      tableEl.innerHTML=`<tr><td colspan="5" class="empty">${q?`No delivery areas match "<strong>${esc(rawQ)}</strong>".`:'No delivery areas found.'}</td></tr>`;
      return;
    }
    tableEl.innerHTML=rows.map(a=>{
      const isCustom=a.id.startsWith('C-');
      const areaLabel=`${esc(a.area)}${isCustom?` <span class="badge custom" title="Custom area">Custom</span>`:''}`;
      const editId=esc(a.id);
      return `<tr>
        <td>${esc(a.division)}</td>
        <td>${esc(a.district)}</td>
        <td>${areaLabel}</td>
        <td><select class="status-select" aria-label="Status" onchange="setAreaStatus(this.closest('tr').dataset.aid,this.value)" data-aid="${editId}">
          <option value="Enable"${areaStatus(a.id)==="Enable"?" selected":""}>Enable</option>
          <option value="Disable"${areaStatus(a.id)==="Disable"?" selected":""}>Disable</option>
        </select></td>
        <td><button class="btn small" onclick="openAreaForm(this.closest('tr').dataset.aid)">Edit</button>${isCustom?`<button class="btn small danger" onclick="removeArea(this.closest('tr').dataset.aid)" style="margin-left:4px">Remove</button>`:''}</td>
      </tr>`.replace('<tr>',`<tr data-aid="${editId}">`);
    }).join('');
  }catch(err){
    console.error('[Sholok] renderAreaTable error:',err);
    tableEl.innerHTML='<tr><td colspan="5" class="empty">An error occurred rendering areas. Please refresh the page.</td></tr>';
  }
}

// ── Rate Groups ──────────────────────────────────────────────────────────────
function openGroupForm(id=null){
  $("groupForm").classList.remove("hidden");$("groupForm").dataset.edit=id||"";
  if(id){const g=groups[id];$("groupStore").value=g.store;$("groupName").value=g.name;$("baseRate").value=g.base;$("additionalRate").value=g.additional;}
  else{$("groupStore").selectedIndex=0;$("groupName").value="";$("baseRate").value="";$("additionalRate").value="";}
  $("groupName").focus();
}
function closeGroupForm(){$("groupForm").classList.add("hidden");}
function saveGroup(){
  const store=$("groupStore").value,name=$("groupName").value,base=Number($("baseRate").value),additional=Number($("additionalRate").value),edit=$("groupForm").dataset.edit;
  if(!store||!name||!Number.isFinite(base)||base<0||!Number.isFinite(additional)||additional<0)return toast("Enter valid store location and rates.");
  const duplicate=Object.values(groups).some(g=>g.id!==edit&&g.store===store&&g.name===name);
  if(duplicate)return toast("This Rate Group already exists for the selected Store Location.");
  const id=edit||"G-"+Date.now();groups[id]={id,store,name,base,additional};
  if(!save())return toast('Rate group saved in memory but could not persist to storage.','error');
  renderAll();updateStats();closeGroupForm();toast("Rate Group saved.");
}
function editGroup(id){openGroupForm(id);}
function deleteGroup(id){
  if(Object.values(assignments).some(a=>a.groupId===id))return toast("This Rate Group is assigned. Remove its assignments first.");
  if(!confirm("Delete this Rate Group?"))return;
  delete groups[id];
  if(!save())return toast('Delete saved in memory but could not persist to storage.','error');
  renderAll();updateStats();toast("Rate Group removed.");
}
function renderGroups(){
  const arr=Object.values(groups);
  $("groupGrid").innerHTML=arr.map(g=>{
    const c2=Number(g.base)+Number(g.additional),c3=Number(g.base)+2*Number(g.additional);
    return `<article class="group-card"><div class="card-head"><div><h3>${esc(g.name)}</h3><small>${esc(g.store)}</small></div></div><div class="rates"><div class="rate-box"><small>Base — 1 KG</small><b>৳${fmt(g.base)}</b></div><div class="rate-box"><small>Additional / KG</small><b>৳${fmt(g.additional)}</b></div></div><div class="rate-summary">1kg ৳${fmt(g.base)} · 2kg ৳${fmt(c2)} · 3kg ৳${fmt(c3)}</div><div class="card-actions"><button class="btn small" onclick="editGroup('${esc(g.id)}')">Edit</button><button class="btn small danger" onclick="deleteGroup('${esc(g.id)}')">Remove</button></div></article>`;
  }).join("")||'<div class="empty">No Rate Groups yet.</div>';
}

// ── Assignments ──────────────────────────────────────────────────────────────
function rateGroupLabel(g){return `${g.name} — ৳${fmt(g.base)} + ৳${fmt(g.additional)}/KG`;}
function renderAssignmentControls(){
  const options=Object.values(groups).map(g=>`<option value="${esc(g.id)}">${esc(rateGroupLabel(g))}</option>`).join("");
  $("assignGroup").innerHTML='<option value="">Select Rate Group</option>'+options;
  $("assignedGroupFilter").innerHTML='<option value="">All Rate Groups</option>'+options;
}
function assignmentAreas(){
  const div=$('assignDivision').value,dist=$('assignDistrict').value,q=($('zoneSearch').value||'').toLowerCase();
  return allAreas().filter(a=>{
    try{
      const divOK=div==='*'||(a.division||"")===getDivisionName(div);
      const dc=getDistrictRecord(dist);
      const distOK=dist==='*'||!dist||(dc&&(a.division||"")===dc.division&&(a.district||"")===dc.name);
      return divOK&&distOK&&(!q||`${a.division||""} ${a.district||""} ${a.area||""}`.toLowerCase().includes(q));
    }catch(err){console.warn('[Sholok] assignmentAreas filter:',err,a);return false;}
  });
}
function assignmentKey(store,areaId){return `${store}||${areaId}`;}
function renderZoneList(){
  const arr=assignmentAreas(),div=$("assignDivision").value,dist=$("assignDistrict").value,store=$("assignStore").value;
  const zt=$("zoneTitle");if(zt)zt.textContent=`Saved Delivery Areas (${arr.length})`;
  const zm=$("zoneMeta");if(zm)zm.textContent=div==="*"?"All Divisions":(dist==="*"?"All Districts":getDistrictRecord(dist)?.name||"");
  $("zoneList").innerHTML=arr.map(a=>{
    const k=assignmentKey(store,a.id),as=assignments[k],g=as?groups[as.groupId]:null,disabled=areaStatus(a.id)==="Disable";
    return `<label class="zone-item${disabled?" disabled":""}"><input type="checkbox" data-key="${esc(k)}" data-areaid="${esc(a.id)}" ${as?"checked":""} ${disabled?"disabled":""}><span><b>${esc(a.area)}</b><small>${esc(a.district)}, ${esc(a.division)}</small></span>${disabled?`<em class="disabled-label">Disabled</em>`:(g?`<span class="badge saved">${esc(g.name)}</span>`:"")}</label>`;
  }).join("")||'<div class="empty">No saved Delivery Areas match this selection.</div>';
}

// FIX #4: assignSelected checks save result and rolls back on failure
function assignSelected(){
  const store=$('assignStore').value,groupId=$('assignGroup').value;
  if(!store)return toast('Select a Store Location first.');
  if(!groupId)return toast('Select a Rate Group first.');
  const checked=[...document.querySelectorAll('#zoneList input[type=checkbox]:checked')];
  if(!checked.length)return toast('Select at least one Delivery Area.');
  const areaMap=new Map(allAreas().map(a=>[a.id,a]));
  const duplicates=[],toAssign=[];
  checked.forEach(ch=>{
    const a=areaMap.get(ch.dataset.areaid);if(!a)return;
    const k=assignmentKey(store,a.id);
    if(assignments[k]){const eg=groups[assignments[k].groupId];duplicates.push(`${a.area}${eg?` (${eg.name})`:""}`);return;}
    toAssign.push({k,a});
  });
  if(duplicates.length){
    const preview=duplicates.slice(0,3).join(", ");
    toast(`Already assigned: ${preview}${duplicates.length>3?` +${duplicates.length-3} more`:""}.`);
  }
  if(!toAssign.length)return;
  // Apply changes in memory first
  toAssign.forEach(({k,a})=>{assignments[k]={key:k,store,division:a.division,district:a.district,area:a.area,areaId:a.id,groupId};});
  // Try to persist
  if(!save()){
    // Rollback memory on save failure
    toAssign.forEach(({k})=>{delete assignments[k];});
    return toast(`Save failed: storage quota exceeded (${toAssign.length} area(s) could not be assigned). Try removing old assignments first.`,'error');
  }
  renderAssignments();renderZoneList();
  if(!duplicates.length)toast(`${toAssign.length} area(s) assigned successfully.`);
}

// FIX #2 + #4: renderAssignments with null-check for missing groups
function renderAssignments(){
  try{
    const q=($('assignmentSearch')||{value:""}).value.toLowerCase();
    const sf=($('assignedStoreFilter')||{value:""}).value;
    const gf=($('assignedGroupFilter')||{value:""}).value;
    const rows=Object.entries(assignments).filter(([k,a])=>{
      const g=groups[a.groupId];
      if(!g)return false; // skip orphaned assignments
      return (!sf||a.store===sf)&&(!gf||a.groupId===gf)&&(!q||`${a.store||""} ${g.name||""} ${a.division||""} ${a.district||""} ${a.area||""}`.toLowerCase().includes(q));
    });
    $('assignmentTable').innerHTML=rows.map(([k,a])=>{
      const g=groups[a.groupId];if(!g)return '';
      const c2=Number(g.base)+Number(g.additional),c3=Number(g.base)+2*Number(g.additional);
      return `<tr><td>${esc(a.store)}</td><td>${esc(g.name)}</td><td>${esc(a.division)}</td><td>${esc(a.district)}</td><td>${esc(a.area)}</td><td class="money">৳${fmt(g.base)}</td><td class="money">৳${fmt(c2)}</td><td class="money">৳${fmt(c3)}</td><td><button class="btn small" onclick="editAssignment('${encodeURIComponent(k)}')">Edit</button> <button class="btn small danger" onclick="removeAssignment('${encodeURIComponent(k)}')">Remove</button></td></tr>`;
    }).join('')||'<tr><td colspan="9" class="empty">No assigned Zone Rates yet.</td></tr>';
  }catch(err){
    console.error('[Sholok] renderAssignments error:',err);
    const tbl=$('assignmentTable');if(tbl)tbl.innerHTML='<tr><td colspan="9" class="empty">An error occurred. Please refresh.</td></tr>';
  }
}
function editAssignment(encoded){
  const k=decodeURIComponent(encoded),a=assignments[k];if(!a)return;
  $('assignStore').value=a.store;
  const di=locations.findIndex(x=>x.name===a.division);
  $('assignDivision').value=di>=0?String(di):'*';
  fillDistrictSelect('assignDistrict',$('assignDivision').value,true);
  const drec=districtRecordsForDivision(String(di),true).find(x=>x.name===a.district&&x.division===a.division);
  $('assignDistrict').value=drec?.value||'*';
  $('assignGroup').value=a.groupId;
  renderZoneList();
  try{document.querySelector(`input[data-key="${CSS.escape(k)}"]`)?.scrollIntoView({block:'center'});}catch(_){}
  toast('Assignment loaded. Change the Rate Group if needed and click Assign Selected Zones.');
}
function removeAssignment(encoded){
  const k=decodeURIComponent(encoded);
  delete assignments[k];
  if(!save())return toast('Remove saved in memory but could not persist to storage.','error');
  renderAll();toast("Assignment removed.");
}
function selectVisible(state){document.querySelectorAll("#zoneList input[type=checkbox]:not(:disabled)").forEach(x=>x.checked=state);}

// ── Event wiring ─────────────────────────────────────────────────────────────
$("newAreaBtn").onclick=()=>openAreaForm(null);
$("cancelArea").onclick=closeAreaForm;
$("saveArea").onclick=saveArea;
$("areaSearch").oninput=renderAreaTable;
$("newGroupBtn").onclick=()=>openGroupForm();
$("cancelGroup").onclick=closeGroupForm;
$("saveGroup").onclick=saveGroup;
$("assignAllBtn").onclick=assignSelected;
$("selectAll").onclick=()=>selectVisible(true);
$("clearAll").onclick=()=>selectVisible(false);
$("zoneSearch").oninput=renderZoneList;
$("assignmentSearch").oninput=renderAssignments;
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
init();
