import $ from 'jquery';
global.$ = global.jQuery = $;
$.fn.modal = jest.fn(() => $());// permet d'utiliser jest.fn avec jquerry (vu sur stack overflow)
