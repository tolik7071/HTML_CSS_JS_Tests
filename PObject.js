/*
 * PObject.js: JavaScript объекты, которые позволяют сохранять данные между
 * сеансами работы с броузером и могут совместно использоваться веб страницами
 * одного каталога с одного и того же сервера.
 *
 * Данный модуль определяет конструктор PObject(), с помощью которого
 * создается хранимый объект.
 * Объекты PObject имеют два общедоступных метода. Метод save() сохраняет
 * текущие значения свойств объекта, а метод forget() удаляет сохраненные
 * значения свойств объекта. Чтобы определить хранимое свойство в объекте
 * PObject, достаточно просто установить свойство, как если бы это был
 * обычный JavaScript объект, и затем вызвать метод save(), чтобы сохранить
 * текущее состояние объекта. Вы не должны использовать имена "save"
 * и "forget" для определения своих свойств, точно так же вы не должны
 * использовать имена, начинающиеся с символа $. Объект PObject предполагает,
 * что значения всех свойств будут иметь строковый тип. Хотя при этом
 * допускается сохранять числовые и логические значения, но при получении
 * данных они будут преобразованы в строки.
 *
 * В процессе создания PObject хранимые данные загружаются и сохраняются
 * во вновь созданном объекте в виде обычных JavaScript свойств, и вы можете
 * использовать PObject точно так же, как обычный JavaScript объект.
 * Обратите внимание: к тому моменту, когда конструктор PObject() вернет
 * управление, хранимые свойства могут быть еще не готовы к использованию
 * и вам нужно подождать, пока в виде асинхронного вызова функции обработчика
 * события onload не будет получено извещение о готовности, * которое передается конструктору.
 *
 * Конструктор:
 *    PObject(name, defaults, onload):
 *
 * Аргументы:
 *
 *   name
 *        Имя, идентифицирующее хранимый объект. Одна страница может хранить
 *        данные в нескольких объектах PObject, и каждый объект PObject
 *        доступен для всех страниц из одного каталога, поэтому данное имя
 *        должно быть уникальным в пределах каталога. Если этот аргумент
 *        содержит значение null или отсутствует, будет использовано
 *        имя файла (а не каталога), содержащего веб страницу.
 *
 *   defaults
 *        Необязательный JavaScript объект. Если сохраненные ранее
 *        значения свойств хранимого объекта найдены не будут (что
 *        может произойти, когда объект PObject создается впервые)
 *        свойства данного объекта будут скопированы во вновь созданный
 *        объект PObject.
 *
 *    onload
 *        TODO
 *
 * Метод PObject.save(lifetimeInDays):
 * Сохраняет свойства объекта PObject и гарантирует, их хранение по меньшей
 * мере указанное число суток.
 *
 * Метод PObject.forget():
 * Удаляет свойства объекта PObject. После этого сохраняет "пустой" объект
 * PObject в хранилище, и если это возможно, определяет, что срок хранения
 * этого объекта уже истек.
 *
 * Примечания к реализации:
 *
 * Совместное использование объектов PObject:
 *
 * Данные, сохраняемые в объекте PObject из одной страницы, будут доступны
 * из других страниц, расположенных в том же каталоге на том же веб сервере.
 * При использовании реализации на базе cookie страницы, расположенные
 * во вложенных каталогах, смогут читать (но не писать) свойства объектов
 * PObject, созданных страницами из родительского каталога.
 * Различные броузеры сохраняют свои cookie файлы в разных хранилищах,
 * потому данные, сохраненные как cookie файлы в одном броузере, будут
 * недоступны в других броузерах.
 *
 * Сведения о безопасности:
 *
 * Данные, сохраняемые в виде объекта PObject, хранятся в незашифрованном
 * виде на жестком диске локальной системы. Приложения, работающие на этом
 * компьютере, могут прочитать эти данные, поэтому PObject не подходит
 * для хранения частной информации, такой как номера кредитных карт,
 * паролей или номеров банковских счетов.
 */

// Это конструктор
function PObject(name, defaults, onload) {
   if (!name) {
      // Если имя не задано, использовать последний компонент URL
      name = window.location.pathname;
      var pos = name.lastIndexOf("/");

      if (pos !=  1)
         name = name.substring(pos+1);
   }

   this.$name = name; // Запомнить имя

   // Вызов делегированного частного метода init(),
   // определяемого реализацией.
   this.$init(name, defaults, onload);
};

// Сохраняет текущее состояние объекта PObject на заданное число суток.
PObject.prototype.save = function(lifetimeInDays) {
   // Для начала преобразовать свойства объекта в одну строку

   // Изначально строка пустая
   var s = "";

   // Цикл по свойствам объекта
   for(var name in this) {

      // Пропустить частные свойства,
      // имена которых начинаются с $
      if (name.charAt(0) == "$") continue;

      // Получить значение свойства
      var value = this[name];
      // Получить тип свойства
      var type = typeof value;

      // Пропустить свойства объекты и функции
      if (type == "object" || type == "function") continue;

      // Отделить свойства знаком &
      if (s.length > 0) s += "&";

      // Добавить имя свойства и кодированное значение
      s += name + ':' + encodeURIComponent(value);
   }

   // Затем вызвать делегированный метод, определяемый реализацией,
   // для фактического сохранения строки.
   this.$save(s, lifetimeInDays);
};

PObject.prototype.forget = function() {
   // Сначала удалить сериализуемые свойства данного объекта с помощью
   // тех же критериев отбора свойств, что использовались в методе save().
   for(var name in this) {
      if (name.charAt(0) == '$') continue;

      var value = this[name];
      var type = typeof value;
      if (type == "function" || type == "object") continue;

      delete this[name]; // Удалить свойство
   }

   // Затем стереть сохраненные ранее данные, записав пустую строку
   // и установив время жизни равным 0.
   this.$save("", 0);
};

// Преобразовать строку в пары имя/значение и превратить их в
// Если строка не определена или пустая, скопировать свойства
// Данный частный метод используется реализациями $init().
PObject.prototype.$parse = function(s, defaults) {
   // Если строка отсутствует, использовать объект по умолчанию
   if (!s) {
      if (defaults)
         for(var name in defaults)
            this[name] = defaults[name];

      return;
   }

   // Пары имя–значение отделяются символом амперсанда, а имя и значение
   // внутри каждой пары   символом двоеточия.
   // Все преобразования выполняются с помощью метода split().

   // Преобразовать строку в массив пар имя/значение
   var props = s.split('&');

   // Цикл по парам имя/значение
   for(var i = 0; i < props.length; i++) {
      var p = props[i];
      // Разбить каждую пару по символу двоеточия
      var a = p.split(':');
      // Декодировать и сохранить в виде свойства
      this[a[0]] = decodeURIComponent(a[1]);
   }
};

/*
 * Далее находится часть модуля, зависящая от реализации.
 * Для каждой из реализаций определяется метод $init(), который загружает
 * хранимые данные, и метод $save(), который эти данные сохраняет.
 */

// использовать cookies
PObject.prototype.$init = function(name, defaults, onload) {
   // Получить все cookies
   var allcookies = document.cookie;

   // Предположить отсутствие cookie
   var data = null;

   // Отыскать начало cookie...
   var start = allcookies.indexOf(name + '=');
   if (start !=  1) {
      // Найдено!

      // Пропустить имя
      start += name.length + 1;

      // Отыскать конец cookie
      var end = allcookies.indexOf(';', start);
      if (end ==  1) end = allcookies.length;

      // Извлечь данные
      data = allcookies.substring(start, end);
   }

   // Преобразовать значение cookie в свойства
   this.$parse(data, defaults);

   // Вызвать асинхронно обработчик onload
   if (onload) {
      var pobj = this;
      setTimeout(function() { onload(pobj, name); }, 0);
   }
};

PObject.prototype.$save = function(s, lifetimeInDays) {
   // Имя и значение cookie
   var cookie = this.$name + '=' + s;

   // Добавить конечную дату
   if (lifetimeInDays != null)
      cookie += "; max age=" + (lifetimeInDays * 24 * 60 * 60);

   // Сохранить cookie
   document.cookie = cookie;
};