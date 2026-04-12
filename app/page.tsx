"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ─── 2025-26 SEASON ───────────────────────────────────────────────────────
const season = {
  record:{w:12,l:4,t:4}, league:{w:3,l:0,t:2,standing:"1st — Tri-County Diamond"}, gf:46,ga:20,
  games:[
    {date:"Aug 25",opp:"Maple Shade",         ha:"A",r:"W",gs:3,ga:2},
    {date:"Sep 8", opp:"Glassboro",            ha:"A",r:"W",gs:1,ga:0,lg:true},
    {date:"Sep 10",opp:"Overbrook",            ha:"A",r:"W",gs:3,ga:2},
    {date:"Sep 12",opp:"Salem County Vo-Tech", ha:"A",r:"W",gs:8,ga:0},
    {date:"Sep 18",opp:"Penns Grove",          ha:"A",r:"T",gs:1,ga:1,lg:true},
    {date:"Sep 22",opp:"Schalick",             ha:"A",r:"W",gs:2,ga:1},
    {date:"Sep 25",opp:"Pitman",               ha:"A",r:"W",gs:3,ga:1},
    {date:"Sep 30",opp:"Pennsville Memorial",  ha:"H",r:"W",gs:1,ga:0,lg:true},
    {date:"Oct 1", opp:"Glassboro",            ha:"H",r:"W",gs:3,ga:0,lg:true},
    {date:"Oct 4", opp:"Northern Burlington",  ha:"A",r:"L",gs:0,ga:6},
    {date:"Oct 6", opp:"Overbrook",            ha:"H",r:"W",gs:3,ga:0},
    {date:"Oct 8", opp:"Salem",                ha:"A",r:"W",gs:8,ga:0},
    {date:"Oct 14",opp:"Penns Grove",          ha:"A",r:"T",gs:2,ga:2,lg:true},
    {date:"Oct 16",opp:"Schalick",             ha:"A",r:"T",gs:0,ga:0},
    {date:"Oct 20",opp:"Pitman",               ha:"H",r:"T",gs:1,ga:1},
    {date:"Oct 23",opp:"Audubon",              ha:"A",r:"L",gs:0,ga:1},
    {date:"Oct 25",opp:"Highland Regional",    ha:"A",r:"W",gs:3,ga:0},
    {date:"Oct 27",opp:"Triton",               ha:"A",r:"L",gs:1,ga:2},
    {date:"Oct 29",opp:"Gateway Regional",     ha:"H",r:"W",gs:3,ga:0},
    {date:"Nov 4", opp:"Palmyra",              ha:"H",r:"L",gs:0,ga:1,po:true,note:"OT"},
  ] as {date:string;opp:string;ha:string;r:string;gs:number;ga:number;lg?:boolean;po?:boolean;note?:string}[],
};

// ─── CAREER STATS ─────────────────────────────────────────────────────────
const CS:Record<string,{fr?:number;so?:number;jr?:number;sr?:number;total:number;yr:number;ht?:number;ast?:number}>={
  // ── 70+ ──────────────────────────────────────────────────────────────────
  "Oscar Hernandez":     {fr:13,so:20,jr:16,sr:29,total:78,yr:1999,ht:12,ast:10},
  // ── 60+ ──────────────────────────────────────────────────────────────────
  "Jeff LaPalomento":    {fr:5, so:13,jr:21,sr:23,total:62,yr:1996,ht:6},
  "Geoff Schaefer":      {fr:5, so:9, jr:26,sr:21,total:61,yr:2015,ht:2},
  // ── 40+ ──────────────────────────────────────────────────────────────────
  "Adrian Ibarra":       {so:7, jr:26,sr:16,total:49,yr:2024,ht:2,ast:12},
  "Kevin Udy":           {fr:4, so:3, jr:15,sr:23,total:45,yr:1984,ht:2,ast:19},
  "Chase Prater":        {fr:1, so:7, jr:8, sr:28,total:44,yr:2021,ht:5,ast:10},
  "Dan Emmans":          {fr:5, so:7, jr:8, sr:24,total:44,yr:1989,ht:4,ast:13},
  "Travis Goss":         {fr:7, so:8, jr:19,sr:9, total:43,yr:2007,ht:1,ast:10},
  "Magnus Ramquist":     {sr:41,total:41,yr:1984,ht:6},
  // ── 30+ ──────────────────────────────────────────────────────────────────
  "Dave Nathans":        {fr:14,so:12,jr:12,total:38,yr:1984,ht:2},
  "Bryce Ayars":         {fr:3, so:7, jr:10,sr:17,total:37,yr:2025,ht:1},
  "Robbie Polk":         {fr:5, so:11,sr:21,total:37,yr:2002,ht:2},
  "Eric Sigurdson":      {sr:32,total:32,yr:1983,ht:4},
  "Will McQueston":      {fr:1, so:3, jr:11,sr:16,total:31,yr:2021,ht:2,ast:22},
  "Chris Williams":      {fr:1, so:5, jr:3, sr:22,total:31,yr:2018,ht:2,ast:14},
  "David Roman":         {so:6, jr:17,sr:8, total:31,yr:2002,ht:1,ast:16},
  "Zach Smick":          {fr:4, so:7, jr:11,sr:8, total:30,yr:2011,ast:10},
  // ── 20+ ──────────────────────────────────────────────────────────────────
  "Craig Patterson":     {fr:2, so:6, jr:12,sr:9, total:29,yr:1993,ht:1},
  "Jack Reistle":        {fr:3, so:10,sr:15,total:28,yr:1986,ht:2},
  "Greg Conner":         {fr:4, so:11,sr:12,total:27,yr:2011,ht:1,ast:10},
  "Randall Clark":       {fr:4, so:10,sr:13,total:27,yr:2000,ht:1},
  "Trevor Lodge":        {jr:10,sr:15,total:25,yr:2019},
  "Andrew Blaszczyk":    {so:9, jr:7, sr:8, total:24,yr:2015,ht:1},
  "Eric Hepler":         {fr:1, so:5, sr:18,total:24,yr:2013},
  "Kevin Shimp":         {fr:1, so:3, jr:11,sr:9, total:24,yr:1991},
  "Dean Sorantino":      {fr:6, so:9, sr:8, total:23,yr:2021,ht:1,ast:14},
  "Drew Geiger":         {fr:2, so:2, jr:6, sr:13,total:23,yr:2009,ht:1,ast:10},
  "Craig Bober":         {fr:1, so:7, jr:7, sr:8, total:23,yr:2005},
  "Scott Lautenbach":    {fr:1, so:6, sr:14,total:21,yr:1980},
  "Brent Williams":      {so:2, jr:12,sr:6, total:20,yr:2023,ht:1},
  "Mickey Demarest":     {fr:2, so:3, jr:8, sr:7, total:20,yr:2014},
  "Scott Taylor":        {fr:5, so:4, jr:3, sr:8, total:20,yr:1998},
  // ── 10-19 ────────────────────────────────────────────────────────────────
  "Kevin Polk":          {so:7, sr:12,total:19,yr:2009},
  "Brady Ewart":         {fr:4, so:12,sr:3, total:19,yr:2005},
  "Charlie Sanclemente": {so:7, sr:12,total:19,yr:2003,ht:1},
  "Herb Weichmann":      {fr:9, so:5, jr:4, total:18,yr:1990,ht:1},
  "James Reinhard":      {sr:18,total:18,yr:1981,ht:1},
  "Trey Parker":         {so:5, sr:12,total:17,yr:2015},
  "Probyn Allen":        {fr:4, so:4, sr:9, total:17,yr:2003},
  "Tim McHarness":       {so:4, sr:13,total:17,yr:1991,ht:2},
  "Brian Udy":           {fr:1, so:4, sr:12,total:17,yr:1981,ht:2,ast:14},
  "Steve Rust":          {jr:9, sr:8, total:17,yr:1980,ht:1},
  "Jesse Norris":        {jr:9, sr:6, total:15,yr:2005,ht:2},
  "Ryan Quirk":          {fr:1, so:3, jr:1, sr:10,total:15,yr:1992},
  "Frank Furfari":       {fr:2, so:4, sr:9, total:15,yr:1987,ht:1},
  "Ben Tucker":          {fr:1, so:3, sr:10,total:14,yr:2008},
  "Paul Hughes":         {fr:2, so:3, jr:6, sr:3, total:14,yr:1998},
  "Justin Olbrich":      {fr:2, so:5, sr:6, total:13,yr:2020},
  "Nate Hitchner":       {fr:1, sr:12,total:13,yr:2019,ht:1},
  "Brandon Dean":        {fr:1, so:1, jr:4, sr:7, total:13,yr:2013},
  "Paul DelMonico":      {fr:1, sr:12,total:13,yr:1991},
  "Dave Krishna":        {so:2, sr:11,total:13,yr:1983,ht:1},
  "Grant Prater":        {fr:1, so:3, sr:9, total:13,yr:2024},
  "Kaleb Gerace":        {fr:3, so:2, jr:4, sr:3, total:12,yr:2023},
  "Kevin Mondragon":     {fr:1, so:1, sr:10,total:12,yr:2019},
  "Alex Norbuts":        {jr:7, sr:5, total:12,yr:2014},
  "Chase Hellick":       {jr:6, sr:6, total:12,yr:2012},
  "Fran Smith":          {fr:2, so:5, sr:5, total:12,yr:2010},
  "AJ Washington":       {fr:2, so:4, sr:6, total:12,yr:1996},
  "Scott Haag":          {fr:2, so:5, sr:5, total:12,yr:1996,ht:1},
  "Pat Love":            {fr:3, so:2, sr:6, total:11,yr:2011},
  "Evan Hathaway":       {fr:1, so:5, sr:5, total:11,yr:2010},
  "TJ Schaefer":         {jr:6, sr:5, total:11,yr:2009},
  "Bill Layton":         {fr:3, so:1, sr:7, total:11,yr:2004},
  "Sam Lamont":          {so:2, sr:9, total:11,yr:1989,ast:12},
  "Robert Woodruff":     {so:3, sr:8, total:11,yr:1987,ht:1},
  "Jake Moore":          {fr:2, so:3, sr:5, total:10,yr:2020,ast:18},
  "Andy Biedermann":     {fr:1, sr:9, total:10,yr:1989},
  "Jon Gonzalez":        {fr:3, so:4, sr:3, total:10,yr:1987},
  "Todd Neaville":       {fr:1, sr:9, total:10,yr:1986},
  "Blake Bialecki":      {fr:4, so:5, jr:1, total:10,yr:2025,ast:14},
  // ── 1-9 ──────────────────────────────────────────────────────────────────
  "Jackson Danner":      {so:2, sr:7, total:9, yr:2017},
  "Kyle Counsellor":     {sr:9, total:9, yr:2010},
  "Randall Franzen":     {so:2, jr:7, total:9, yr:2004},
  "Matt Smick":          {jr:4, sr:5, total:9, yr:2003},
  "Nick Dibble":         {jr:4, sr:5, total:9, yr:2002},
  "Andy Ritchie":        {fr:1, sr:8, total:9, yr:1986,ht:1},
  "Olof Johansson":      {sr:9, total:9, yr:1985},
  "Ayden Ellis":         {fr:3, so:2, jr:4, total:9, yr:2026},
  "Allan Mondragon":     {fr:1, so:2, sr:5, total:8, yr:2018},
  "Coleman Weatherstone":{so:2, sr:6, total:8, yr:2017},
  "Seth Frost":          {fr:1, sr:7, total:8, yr:2001},
  "David Kinsley":       {fr:2, so:1, sr:5, total:8, yr:1998},
  "Wes Stubbins":        {fr:2, sr:6, total:8, yr:1990},
  "Brian Ritchie":       {fr:1, so:1, jr:2, sr:4, total:8, yr:1989},
  "Dave Burbage":        {so:5, sr:3, total:8, yr:1988,ht:1},
  "Scott Jones":         {fr:1, so:4, sr:3, total:8, yr:1988},
  "Doug Hathaway":       {jr:3, sr:5, total:8, yr:1981},
  "Cole Lucas":          {fr:3, so:1, jr:3, total:7, yr:2024},
  "Zach Telsey":         {so:2, jr:1, sr:4, total:7, yr:2016},
  "Matt Simmermon":      {so:5, sr:2, total:7, yr:2013},
  "Louie Harvey":        {so:5, sr:2, total:7, yr:2010},
  "Aaron Tepfer":        {fr:1, sr:6, total:7, yr:1994},
  "Mike Donohue":        {sr:7, total:7, yr:1994},
  "Joe McCall":          {fr:3, so:2, sr:2, total:7, yr:1986},
  "Ben Lippincott":      {fr:1, so:1, jr:4, sr:1, total:7, yr:2025},
  "Nick DiTeodoro":      {fr:2, so:1, jr:4, total:7, yr:2026},
  "Spencer Schaefer":    {fr:1, sr:5, total:6, yr:2012},
  "Mike Love":           {fr:1, sr:5, total:6, yr:2009},
  "Deron Morgan":        {so:4, sr:2, total:6, yr:1998},
  "Chris Varga":         {fr:1, so:1, sr:4, total:6, yr:1993},
  "Quoc Nguyen":         {fr:2, so:3, sr:1, total:6, yr:1984},
  "Tom Boger":           {fr:1, sr:5, total:6, yr:1984},
  "Chris Lloyd":         {fr:1, sr:5, total:6, yr:1982},
  "Erich Lipovsky":      {fr:3, so:3, total:6, yr:2024},
  "Gabe Chiarelli":      {jr:4, sr:1, total:5, yr:2017},
  "Andrew Horner":       {sr:5, total:5, yr:2016},
  "Dylan Varner":        {so:2, sr:3, total:5, yr:2015},
  "Derek Smith":         {fr:1, sr:4, total:5, yr:2013},
  "Greg Tavani":         {so:2, sr:3, total:5, yr:2006},
  "Bill Kapustiak":      {sr:5, total:5, yr:2005},
  "Michael Tavani":      {fr:1, so:3, sr:1, total:5, yr:2003},
  "Jose Roman":          {sr:5, total:5, yr:2000},
  "Tim Carr":            {jr:4, sr:1, total:5, yr:1999},
  "Matt McHarness":      {sr:5, total:5, yr:1994},
  "Andy Ware":           {fr:2, so:2, sr:1, total:5, yr:1993},
  "Karl Dorwart":        {fr:2, sr:3, total:5, yr:1993},
  "Colin Burke":         {fr:1, sr:4, total:5, yr:1993},
  "Ryan Flemming":       {sr:5, total:5, yr:1988},
  "Ky Nguyen":           {fr:2, so:1, sr:2, total:5, yr:1986},
  "Landon Guglielmo":    {fr:1, so:4, total:5, yr:2026},
  "Kysen West":          {fr:1, sr:3, total:4, yr:2019},
  "Pierce Prater":       {sr:4, total:4, yr:2019},
  "Justin Miller":       {sr:4, total:4, yr:2013},
  "Dillon Martell":      {fr:3, sr:1, total:4, yr:2012},
  "Jake Allen":          {fr:1, sr:3, total:4, yr:2010},
  "Baltazar Constantino":{sr:4, total:4, yr:2005},
  "Louis Epstein":       {sr:4, total:4, yr:2001},
  "Nick Baranowski":     {sr:4, total:4, yr:2000},
  "Josh Sarricino":      {fr:1, sr:3, total:4, yr:1998},
  "Dane Denny":          {fr:1, sr:3, total:4, yr:1997},
  "Brian Denny":         {fr:1, sr:3, total:4, yr:1994},
  "Dwight Campbell":     {fr:3, sr:1, total:4, yr:1993},
  "John Foulks":         {fr:2, so:2, total:4, yr:1993},
  "Barry Pedrick":       {fr:2, so:2, total:4, yr:1990},
  "Jon Stoms":           {fr:2, so:2, total:4, yr:1987},
  "John Pinto":          {sr:4, total:4, yr:1987},
  "Jonathan Bender":     {fr:2, so:2, total:4, yr:1986},
  "Steve Demarest":      {sr:4, total:4, yr:1984},
  "Mike Bickford":       {fr:1, sr:3, total:4, yr:1982},
  "Rex Bohn":            {fr:1, sr:3, total:4, yr:1981},
  "Garrett Bostwick":    {fr:2, so:2, total:4, yr:1979},
  "Jack Morris":         {so:2, sr:1, total:3, yr:2025},
  "Evan Gao":            {fr:3, total:3, yr:2022},
  "Brian Venosa":        {fr:3, total:3, yr:2021},
  "Andrew Krivda":       {fr:3, total:3, yr:2020},
  "Gage Foote":          {fr:1, so:2, total:3, yr:2020},
  "Antonio Saughelli":   {fr:3, total:3, yr:2019},
  "Jamie Vergara":       {fr:1, so:2, total:3, yr:2019},
  "Drew Sorbello":       {fr:1, so:2, total:3, yr:2017},
  "Brice Monefeldt":     {fr:1, so:2, total:3, yr:2016},
  "Patrick Tierno":      {fr:1, so:2, total:3, yr:2013},
  "Ryan Bober":          {fr:1, so:1, sr:1, total:3, yr:2007},
  "JP Swoyer":           {fr:1, so:1, sr:1, total:3, yr:2006},
  "Jason Norris":        {so:2, sr:1, total:3, yr:2006},
  "Randy Wickersham":    {so:2, sr:1, total:3, yr:2005},
  "Nick Godsmark":       {fr:1, so:1, sr:1, total:3, yr:2001},
  "DJ Goss":             {fr:3, total:3, yr:2000},
  "Justin Wolfe":        {fr:1, so:2, total:3, yr:1999},
  "Scott Cassaday":      {fr:2, sr:1, total:3, yr:1997},
  "Jeff Grove":          {fr:1, so:2, total:3, yr:1997},
  "Sean Weiser":         {sr:3, total:3, yr:1989},
  "Felix Wilkes":        {sr:3, total:3, yr:1987},
  "Dante Holmes":        {fr:3, total:3, yr:2024},
  "Sid Leevy":           {fr:3, total:3, yr:2024},
  "Jeff Covely":         {fr:1, so:1, total:2, yr:2023},
  "Dalton Berry":        {fr:2, total:2, yr:2023},
  "Micah Bradway":       {fr:1, so:1, total:2, yr:2022},
  "Caleb Carter":        {fr:2, total:2, yr:2022},
  "Jesse Bray":          {fr:1, so:1, total:2, yr:2022},
  "Jayden Kennedy":      {fr:2, total:2, yr:2021},
  "Zach Eller":          {fr:1, so:1, total:2, yr:2019},
  "Jimmy Paranzino":     {fr:2, total:2, yr:2019},
  "Dan Love":            {so:2, total:2, yr:2012},
  "Scott Goranson":      {so:2, total:2, yr:2012},
  "Michael Maley":       {so:2, total:2, yr:2011},
  "Zach Burnham":        {fr:1, so:1, total:2, yr:2009},
  "Kevin Carney":        {fr:1, so:1, total:2, yr:2007},
  "Chris Polk":          {so:2, total:2, yr:2005},
  "Zach Ahl":            {so:2, total:2, yr:2004},
  "Tyler Bailey":        {so:2, total:2, yr:2003},
  "Bryan Shumaker":      {so:2, total:2, yr:2003},
  "Brad English":        {so:2, total:2, yr:2000},
  "Patrick Kille":       {so:2, total:2, yr:1999},
  "James Norris":        {so:2, total:2, yr:1998},
  "Bruce Bobbitt":       {so:2, total:2, yr:1997},
  "Andy Varga":          {so:2, total:2, yr:1996},
  "Matt Foote":          {fr:1, so:1, total:2, yr:1994},
  "Nick DelMonico":      {so:2, total:2, yr:1993},
  "Charles Baum":        {fr:1, so:1, total:2, yr:1992},
  "Aaron Weiser":        {fr:1, so:1, total:2, yr:1992},
  "Ken Chapman":         {fr:1, so:1, total:2, yr:1991},
  "Thanh Mai":           {fr:1, so:1, total:2, yr:1990},
  "Urs Altorfer":        {so:2, total:2, yr:1985},
  "Doug Smith":          {so:2, total:2, yr:1984},
  "Robert Russell":      {fr:2, total:2, yr:1980},
  "Jeff Ramos":          {fr:2, total:2, yr:1979},
  "William Ridgeway":    {fr:2, total:2, yr:1979},
  "Miguel Llarena":      {fr:2, total:2, yr:1979},
  "Josh Olbrich":        {fr:1, so:1, total:2, yr:2027},
  "Josef Hummel":        {so:2, total:2, yr:2025},
  "Jake Lewis":          {so:2, total:2, yr:2026},
  "Alex Lippincott":     {so:2, total:2, yr:2025},
  "Tyler Robertson":     {so:2, total:2, yr:2027},
  "Dante Mistichelli":   {total:1, yr:2024},
  "Joe Kurpis":          {total:1, yr:2024},
  "Ryan Polk":           {total:1, yr:2024},
  "Tim Schwienbacher":   {total:1, yr:2023},
  "Edward Whelan":       {total:1, yr:2023},
  "Daegen Shaw":         {total:1, yr:2022},
  "Hank Guy":            {total:1, yr:2021},
  "Ryan Hopp":           {total:1, yr:2021},
  "Owen Smith":          {total:1, yr:2021},
  "Seamus Riley":        {total:1, yr:2020},
  "George Rey":          {total:1, yr:2019},
  "Zac Moore":           {total:1, yr:2019},
  "Henrik Hoeldtke":     {total:1, yr:2019},
  "Nick Saia":           {total:1, yr:2018},
  "Billy Gantz":         {total:1, yr:2018},
  "Nick Mahoney":        {total:1, yr:2018},
  "Colten Colican":      {total:1, yr:2017},
  "Richard Harvey":      {total:1, yr:2017},
  "Connor Hopkins":      {total:1, yr:2017},
  "Jacob Lodge":         {total:1, yr:2017},
  "Matt Counsellor":     {total:1, yr:2016},
  "Hayden Varner":       {total:1, yr:2016},
  "Derek Guy":           {total:1, yr:2015},
  "Alec Borzio":         {total:1, yr:2014},
  "Nick Painter":        {total:1, yr:2014},
  "Tyler Measel":        {total:1, yr:2013},
  "Zach Guy":            {total:1, yr:2012},
  "Ryan Segrest":        {total:1, yr:2011},
  "CJ Wittmann":         {total:1, yr:2010},
  "Chalkley Reynolds":   {total:1, yr:2010},
  "Dallas Duffield":     {total:1, yr:2010},
  "Andrew Valente":      {total:1, yr:2010},
  "Zach Riley":          {total:1, yr:2009},
  "Alex Zeidler":        {total:1, yr:2009},
  "David Andiario":      {total:1, yr:2008},
  "Mark Bitter":         {total:1, yr:2007},
  "Michael Drake":       {total:1, yr:2007},
  "Shane Turek":         {total:1, yr:2006},
  "Brandon Smick":       {total:1, yr:2006},
  "David Zeck":          {total:1, yr:2006},
  "Kris Schulze":        {total:1, yr:2006},
  "John Quigley":        {total:1, yr:2005},
  "Kyle Lauff":          {total:1, yr:2005},
  "Brint Ewart":         {total:1, yr:2003},
  "Shane Lesher":        {total:1, yr:2003},
  "Randy Elder":         {total:1, yr:2002},
  "Randy Bergh":         {total:1, yr:2000},
  "DR Ayars":            {total:1, yr:2000},
  "Andrew Joyce":        {total:1, yr:2000},
  "Blake Simpkins":      {total:1, yr:2000},
  "Andy Lauff":          {total:1, yr:2000},
  "Robert McCardle":     {total:1, yr:2000},
  "George Bradbury":     {total:1, yr:1999},
  "Marco Chiarelli":     {total:1, yr:1998},
  "Mike DeMarcantonio":  {total:1, yr:1998},
  "Bill Loufik":         {total:1, yr:1998},
  "Scott Coombs":        {total:1, yr:1998},
  "Josh Ahl":            {total:1, yr:1997},
  "Justin Meillier":     {total:1, yr:1997},
  "Vinnie Romano":       {total:1, yr:1996},
  "Brian Adams":         {total:1, yr:1995},
  "Mike Ehrman":         {total:1, yr:1995},
  "Pete Larrabee":       {total:1, yr:1995},
  "David Mercado":       {total:1, yr:1994},
  "Billy Olbrich":       {total:1, yr:1993},
  "Jason Coleman":       {total:1, yr:1993},
  "Danny Kolva":         {total:1, yr:1992},
  "Michael Klinke":      {total:1, yr:1991},
  "Don Fischbach":       {total:1, yr:1990},
  "Kevin Pedrick":       {total:1, yr:1990},
  "Michael Murschell":   {total:1, yr:1990},
  "John Burger":         {total:1, yr:1990},
  "Darren Huck":         {total:1, yr:1989},
  "Pat Quigley":         {total:1, yr:1989},
  "Scott McCall":        {total:1, yr:1988},
  "David Davis":         {total:1, yr:1988},
  "Glendon Wheatley":    {total:1, yr:1987},
  "Kier Robinson":       {total:1, yr:1986},
  "Chris Sparks":        {total:1, yr:1986},
  "Dave Moore":          {total:1, yr:1986},
  "Warren Gruff":        {total:1, yr:1984},
  "William Colsch":      {total:1, yr:1984},
  "Peter Bickford":      {total:1, yr:1983},
  "Scott Fowler":        {total:1, yr:1983},
  "Chuck Shadle":        {total:1, yr:1983},
  "David Fedora":        {total:1, yr:1982},
  "Todd Ingersoll":      {total:1, yr:1981},
  "Dwayne Hill":         {total:1, yr:1978},
  "Brendon Curtis":      {total:1, yr:2025},
  "Zyler Szatny":        {total:1, yr:2024},
  "Connor Williams":     {total:1, yr:2024},
  "Enzo Bell-Miller":    {total:1, yr:2027},
  "Don Milhomme":        {total:1, yr:2026},
  "Aiden Milici":        {total:1, yr:2027},
}

const alumni=[
  {l:"Adams",f:"Brian",y:"1994–1995"},{l:"Ahl",f:"Josh",y:"1997"},{l:"Ahl",f:"Zach",y:"2001–2004"},
  {l:"Allen",f:"Jake",y:"2007–2010"},{l:"Allen",f:"Probyn",y:"2001–2003"},{l:"Alliegro",f:"Anthony",y:"2019"},
  {l:"Altiery",f:"Jordan",y:"2017"},{l:"Altorfer",f:"Urs",y:"1985"},{l:"Andiario",f:"David",y:"2007–2008"},
  {l:"Angelus",f:"Charles",y:"2020–2021"},{l:"Ayars",f:"Bryce",y:"2022–2025"},{l:"Ayars",f:"DR",y:"1998–2000"},
  {l:"Bailey",f:"Charles",y:"1987"},{l:"Bailey",f:"Tyler",y:"2003"},{l:"Baranowski",f:"Nick",y:"1998 & 2000"},
  {l:"Baum",f:"Charles",y:"1992"},{l:"Bell-Miller",f:"Enzo",y:"2027"},{l:"Bender",f:"Brian",y:"1995–1997"},
  {l:"Bender",f:"Jonathan",y:"1984–1986"},{l:"Bergh",f:"Randy",y:"2000"},{l:"Berry",f:"Dalton",y:"2023"},
  {l:"Beyer",f:"Lars",y:"1995–1996"},{l:"Bialecki",f:"Blake",y:"2022–2025"},{l:"Bickford",f:"Mike",y:"1980–1982"},
  {l:"Bickford",f:"Peter",y:"1981–1983"},{l:"Biedermann",f:"Andy",y:"1988–1989"},{l:"Bitter",f:"Mark",y:"2007"},
  {l:"Blaszczyk",f:"Andrew",y:"2013–2015"},{l:"Bobbitt",f:"Bruce",y:"1994–1997"},{l:"Bober",f:"Craig",y:"2002–2005"},
  {l:"Bober",f:"Ryan",y:"2004–2007"},{l:"Boger",f:"Tom",y:"1984"},{l:"Bohn",f:"Rex",y:"1981"},
  {l:"Borzio",f:"Alec",y:"2014"},{l:"Bostwick",f:"Garrett",y:"1979"},{l:"Bradbury",f:"George",y:"1999"},
  {l:"Bradway",f:"Micah",y:"2022"},{l:"Bray",f:"Jesse",y:"2022"},{l:"Burke",f:"Colin",y:"1993"},
  {l:"Burger",f:"John",y:"1990"},{l:"Burbage",f:"Dave",y:"1988"},{l:"Burnham",f:"Zach",y:"2009"},
  {l:"Campbell",f:"Dwight",y:"1993"},{l:"Carney",f:"Kevin",y:"2007"},{l:"Carr",f:"Tim",y:"1996–1999"},
  {l:"Carter",f:"Caleb",y:"2020–2022"},{l:"Carter",f:"Spencer",y:"2015–2016"},{l:"Cassaday",f:"Scott",y:"1995–1997"},
  {l:"Chapman",f:"Ken",y:"1990–1991"},{l:"Chiarelli",f:"Gabe",y:"2015–2017"},{l:"Chiarelli",f:"Marco",y:"1995 & 1998"},
  {l:"Clark",f:"Randall",y:"1998–2000"},{l:"Colican",f:"Colten",y:"2015–2017"},{l:"Coleman",f:"Jason",y:"1992–1993"},
  {l:"Colsch",f:"William",y:"1984"},{l:"Conner",f:"Greg",y:"2009–2011"},{l:"Constantino",f:"Baltazar",y:"2004"},
  {l:"Coombs",f:"Scott",y:"1998"},{l:"Counsellor",f:"Kyle",y:"2008–2010"},{l:"Counsellor",f:"Matt",y:"2015–2016"},
  {l:"Covely",f:"Jeff",y:"2021–2023"},{l:"Curtis",f:"Brendon",y:"2025"},{l:"Danner",f:"Jackson",y:"2014–2017"},
  {l:"Davis",f:"David",y:"1988"},{l:"Dean",f:"Brandon",y:"2010–2013"},{l:"DelMonico",f:"Nick",y:"1993"},
  {l:"DelMonico",f:"Paul",y:"1988–1991"},{l:"Demarest",f:"Mickey",y:"2011–2014"},{l:"Demarest",f:"Steve",y:"1984"},
  {l:"DeMarcantonio",f:"Mike",y:"1998"},{l:"Denny",f:"Brian",y:"1991–1994"},{l:"Denny",f:"Dane",y:"1994–1997"},
  {l:"DiTeodoro",f:"Nick",y:"2026"},{l:"Dibble",f:"Nick",y:"2002"},{l:"Donohue",f:"Mike",y:"1994"},
  {l:"Dorwart",f:"Karl",y:"1993"},{l:"Drake",f:"Michael",y:"2007"},{l:"Duffield",f:"Dallas",y:"2010"},
  {l:"Emmans",f:"Dan",y:"1986–1989"},{l:"English",f:"Brad",y:"1999–2000"},{l:"Epstein",f:"Louis",y:"1999–2001"},
  {l:"Ewart",f:"Brady",y:"2003–2005"},{l:"Ewart",f:"Brint",y:"2001–2003"},{l:"Fedora",f:"Brian",y:"1979–1980"},
  {l:"Fedora",f:"David",y:"1980–1982"},{l:"Fischbach",f:"Don",y:"1988"},{l:"Flemming",f:"Ryan",y:"1987–1988"},
  {l:"Foote",f:"Gage",y:"2019–2020"},{l:"Foote",f:"Matt",y:"1991–1994"},{l:"Foulks",f:"John",y:"1991–1993"},
  {l:"Fowler",f:"Scott",y:"1983"},{l:"Franzen",f:"Randall",y:"2002–2004"},{l:"Frost",f:"Seth",y:"2000–2001"},
  {l:"Furfari",f:"Frank",y:"1985–1987"},{l:"Gantz",f:"Billy",y:"2017–2019"},{l:"Gao",f:"Evan",y:"2022"},
  {l:"Geiger",f:"Drew",y:"2006–2009"},{l:"Gerace",f:"Kaleb",y:"2020–2023"},{l:"Godsmark",f:"Nick",y:"2001"},
  {l:"Gonzalez",f:"Jon",y:"1987"},{l:"Goranson",f:"Scott",y:"2012"},{l:"Goss",f:"DJ",y:"2000"},
  {l:"Goss",f:"Travis",y:"2004–2007"},{l:"Guglielmo",f:"Landon",y:"2026"},{l:"Guy",f:"Derek",y:"2015"},
  {l:"Guy",f:"Hank",y:"2021"},{l:"Guy",f:"Zach",y:"2012"},{l:"Haag",f:"Scott",y:"1996"},
  {l:"Harvey",f:"Louie",y:"2010"},{l:"Harvey",f:"Richard",y:"2017"},{l:"Hathaway",f:"Doug",y:"1981"},
  {l:"Hathaway",f:"Evan",y:"2010"},{l:"Hellick",f:"Chase",y:"2012"},{l:"Hepler",f:"Eric",y:"2011–2013"},
  {l:"Hernandez",f:"Oscar",y:"1996–1999"},{l:"Hill",f:"Dwayne",y:"1978"},{l:"Hitchner",f:"Nate",y:"2019"},
  {l:"Hoeldtke",f:"Henrik",y:"2019"},{l:"Holmes",f:"Dante",y:"2024"},{l:"Hopkins",f:"Connor",y:"2017"},
  {l:"Hopp",f:"Ryan",y:"2021"},{l:"Horner",f:"Andrew",y:"2016"},{l:"Huck",f:"Darren",y:"1989"},
  {l:"Hughes",f:"Paul",y:"1995–1998"},{l:"Hummel",f:"Josef",y:"2025"},{l:"Ibarra",f:"Adrian",y:"2021–2024"},
  {l:"Ingersoll",f:"Todd",y:"1981"},{l:"Johansson",f:"Olof",y:"1985"},{l:"Jones",f:"Scott",y:"1988"},
  {l:"Joyce",f:"Andrew",y:"2000"},{l:"Kapustiak",f:"Bill",y:"2005"},{l:"Kennedy",f:"Jayden",y:"2021"},
  {l:"Kille",f:"Patrick",y:"1999"},{l:"Kinsley",f:"David",y:"1998"},{l:"Klinke",f:"Michael",y:"1991"},
  {l:"Kolva",f:"Danny",y:"1992"},{l:"Krishna",f:"Dave",y:"1983"},{l:"Krivda",f:"Andrew",y:"2020"},
  {l:"Kurpis",f:"Joe",y:"2024"},{l:"LaPalomento",f:"Jeff",y:"1993–1996"},{l:"Larrabee",f:"Pete",y:"1995"},
  {l:"Lauff",f:"Andy",y:"2000"},{l:"Lauff",f:"Kyle",y:"2005"},{l:"Lautenbach",f:"Scott",y:"1978–1980"},
  {l:"Lamont",f:"Sam",y:"1989"},{l:"Layton",f:"Bill",y:"2002–2004"},{l:"Leevy",f:"Sid",y:"2024"},
  {l:"Lesher",f:"Shane",y:"2003"},{l:"Lewis",f:"Jake",y:"2026"},{l:"Lipovsky",f:"Erich",y:"2022–2024"},
  {l:"Lippincott",f:"Alex",y:"2025"},{l:"Lippincott",f:"Ben",y:"2022–2025"},{l:"Llarena",f:"Miguel",y:"1979"},
  {l:"Lloyd",f:"Chris",y:"1982"},{l:"Lodge",f:"Jacob",y:"2015–2017"},{l:"Lodge",f:"Trevor",y:"2017–2019"},
  {l:"Loufik",f:"Bill",y:"1998"},{l:"Love",f:"Dan",y:"2012"},{l:"Love",f:"Mike",y:"2007–2009"},
  {l:"Love",f:"Pat",y:"2009–2011"},{l:"Lucas",f:"Cole",y:"2024"},{l:"Mahoney",f:"Nick",y:"2018"},
  {l:"Mai",f:"Thanh",y:"1990"},{l:"Maley",f:"Michael",y:"2011"},{l:"Martell",f:"Dillon",y:"2010–2012"},
  {l:"McCall",f:"Joe",y:"1984–1986"},{l:"McCall",f:"Scott",y:"1988"},{l:"McCardle",f:"Robert",y:"2000"},
  {l:"McHarness",f:"Matt",y:"1991–1994"},{l:"McHarness",f:"Tim",y:"1989–1991"},{l:"McQueston",f:"Will",y:"2018–2021"},
  {l:"Measel",f:"Tyler",y:"2013"},{l:"Meillier",f:"Justin",y:"1997"},{l:"Mercado",f:"David",y:"1994"},
  {l:"Milici",f:"Aiden",y:"2027"},{l:"Milhomme",f:"Don",y:"2026"},{l:"Miller",f:"Justin",y:"2011–2013"},
  {l:"Mistichelli",f:"Dante",y:"2024"},{l:"Monefeldt",f:"Brice",y:"2014–2016"},{l:"Mondragon",f:"Allan",y:"2015–2018"},
  {l:"Mondragon",f:"Kevin",y:"2017–2019"},{l:"Moore",f:"Dave",y:"1986"},{l:"Moore",f:"Jake",y:"2017–2020"},
  {l:"Moore",f:"Zac",y:"2019"},{l:"Morgan",f:"Deron",y:"1998"},{l:"Morris",f:"Jack",y:"2025"},
  {l:"Murschell",f:"Michael",y:"1990"},{l:"Nathans",f:"Dave",y:"1982–1984"},{l:"Neaville",f:"Todd",y:"1983–1986"},
  {l:"Nguyen",f:"Ky",y:"1984–1986"},{l:"Nguyen",f:"Quoc",y:"1982–1984"},{l:"Norbuts",f:"Alex",y:"2012–2014"},
  {l:"Norris",f:"James",y:"1996–1998"},{l:"Norris",f:"Jason",y:"2004–2006"},{l:"Norris",f:"Jesse",y:"2003–2005"},
  {l:"Olbrich",f:"Billy",y:"1993"},{l:"Olbrich",f:"Josh",y:"2025–2027"},{l:"Olbrich",f:"Justin",y:"2018–2020"},
  {l:"Painter",f:"Nick",y:"2012–2014"},{l:"Paranzino",f:"Jimmy",y:"2019"},{l:"Parker",f:"Trey",y:"2013–2015"},
  {l:"Patterson",f:"Craig",y:"1990–1993"},{l:"Pedrick",f:"Barry",y:"1988–1990"},{l:"Pedrick",f:"Kevin",y:"1988–1990"},
  {l:"Pinto",f:"John",y:"1987"},{l:"Polk",f:"Chris",y:"2003–2005"},{l:"Polk",f:"Kevin",y:"2006–2009"},
  {l:"Polk",f:"Robbie",y:"1999–2002"},{l:"Polk",f:"Ryan",y:"2024"},{l:"Prater",f:"Chase",y:"2018–2021"},
  {l:"Prater",f:"Grant",y:"2021–2024"},{l:"Prater",f:"Pierce",y:"2016–2019"},{l:"Quigley",f:"John",y:"2005"},
  {l:"Quigley",f:"Pat",y:"1989"},{l:"Quirk",f:"Ryan",y:"1989–1992"},{l:"Ramquist",f:"Magnus",y:"1981–1984"},
  {l:"Ramos",f:"Jeff",y:"1979"},{l:"Reinhard",f:"James",y:"1978–1981"},{l:"Reistle",f:"Jack",y:"1983–1986"},
  {l:"Rey",f:"George",y:"2019"},{l:"Reynolds",f:"Chalkley",y:"2010"},{l:"Ridgeway",f:"William",y:"1979"},
  {l:"Riley",f:"Seamus",y:"2020"},{l:"Riley",f:"Zach",y:"2007–2009"},{l:"Ritchie",f:"Andy",y:"1984–1986"},
  {l:"Ritchie",f:"Brian",y:"1986–1989"},{l:"Robertson",f:"Tyler",y:"2027"},{l:"Robinson",f:"Kier",y:"1986"},
  {l:"Roman",f:"David",y:"1999–2002"},{l:"Roman",f:"Jose",y:"1997–2000"},{l:"Romano",f:"Vinnie",y:"1996"},
  {l:"Russell",f:"Robert",y:"1978–1980"},{l:"Rust",f:"Steve",y:"1978–1980"},{l:"Saia",f:"Nick",y:"2016–2018"},
  {l:"Sanclemente",f:"Charlie",y:"2001–2003"},{l:"Sarricino",f:"Josh",y:"1995–1998"},{l:"Saughelli",f:"Antonio",y:"2016–2019"},
  {l:"Schaefer",f:"Geoff",y:"2012–2015"},{l:"Schaefer",f:"Spencer",y:"2010–2012"},{l:"Schaefer",f:"TJ",y:"2006–2009"},
  {l:"Schulze",f:"Kris",y:"2006"},{l:"Schwienbacher",f:"Tim",y:"2023"},{l:"Segrest",f:"Ryan",y:"2011"},
  {l:"Shadle",f:"Chuck",y:"1983"},{l:"Shaw",f:"Daegen",y:"2022"},{l:"Shimp",f:"Kevin",y:"1988–1991"},
  {l:"Shumaker",f:"Bryan",y:"2001–2003"},{l:"Sigurdson",f:"Eric",y:"1980–1983"},{l:"Simpkins",f:"Blake",y:"2000"},
  {l:"Simmermon",f:"Matt",y:"2011–2013"},{l:"Smith",f:"Derek",y:"2010–2013"},{l:"Smith",f:"Doug",y:"1984"},
  {l:"Smith",f:"Fran",y:"2008–2010"},{l:"Smith",f:"Owen",y:"2021"},{l:"Smick",f:"Brandon",y:"2004–2006"},
  {l:"Smick",f:"Matt",y:"2001–2003"},{l:"Smick",f:"Zach",y:"2008–2011"},{l:"Sorbello",f:"Drew",y:"2015–2017"},
  {l:"Sorantino",f:"Dean",y:"2018–2021"},{l:"Sparks",f:"Chris",y:"1986"},{l:"Stoms",f:"Jon",y:"1987"},
  {l:"Stubbins",f:"Wes",y:"1988–1990"},{l:"Swoyer",f:"JP",y:"2004–2006"},{l:"Szatny",f:"Zyler",y:"2024"},
  {l:"Tavani",f:"Greg",y:"2003–2006"},{l:"Tavani",f:"Michael",y:"2001–2003"},{l:"Taylor",f:"Scott",y:"1995–1998"},
  {l:"Telsey",f:"Zach",y:"2013–2016"},{l:"Tepfer",f:"Aaron",y:"1992–1994"},{l:"Tierno",f:"Patrick",y:"2011–2013"},
  {l:"Tucker",f:"Ben",y:"2005–2008"},{l:"Turek",f:"Shane",y:"2004–2006"},{l:"Udy",f:"Brian",y:"1978–1981"},
  {l:"Udy",f:"Kevin",y:"1981–1984"},{l:"Valente",f:"Andrew",y:"2010"},{l:"Varga",f:"Andy",y:"1993–1996"},
  {l:"Varga",f:"Chris",y:"1990–1993"},{l:"Varner",f:"Dylan",y:"2013–2015"},{l:"Varner",f:"Hayden",y:"2014–2016"},
  {l:"Venosa",f:"Brian",y:"2021"},{l:"Vergara",f:"Jamie",y:"2017–2019"},{l:"Ware",f:"Andy",y:"1990–1993"},
  {l:"Washington",f:"AJ",y:"1994–1996"},{l:"Weatherstone",f:"Coleman",y:"2015–2017"},{l:"Weichmann",f:"Herb",y:"1988–1990"},
  {l:"Weiser",f:"Aaron",y:"1990–1992"},{l:"Weiser",f:"Sean",y:"1987–1989"},{l:"West",f:"Kysen",y:"2017–2019"},
  {l:"Wheatley",f:"Glendon",y:"1987"},{l:"Whelan",f:"Edward",y:"2023"},{l:"Wickersham",f:"Randy",y:"2003–2005"},
  {l:"Wilkes",f:"Felix",y:"1985–1987"},{l:"Williams",f:"Brent",y:"2020–2023"},{l:"Williams",f:"Chris",y:"2015–2018"},
  {l:"Williams",f:"Connor",y:"2024"},{l:"Wittmann",f:"CJ",y:"2010"},{l:"Wolfe",f:"Justin",y:"1997–1999"},
  {l:"Woodruff",f:"Robert",y:"1985–1987"},{l:"Zeck",f:"David",y:"2004–2006"},{l:"Zeidler",f:"Alex",y:"2007–2009"},
];
const CGC:Record<string,{name:string;goals:number;year:number}[]>={
  "70 Goal Club":[{name:"Oscar Hernandez",goals:78,year:1999}],
  "60 Goal Club":[{name:"Jeff LaPalomento",goals:62,year:1996},{name:"Geoff Schaefer",goals:61,year:2015}],
  "40 Goal Club":[{name:"Adrian Ibarra",goals:49,year:2024},{name:"Kevin Udy",goals:45,year:1984},{name:"Dan Emmans",goals:44,year:1989},{name:"Chase Prater",goals:44,year:2021},{name:"Travis Goss",goals:43,year:2007},{name:"Magnus Ramquist",goals:41,year:1984}],
  "30 Goal Club":[{name:"Dave Nathans",goals:38,year:1984},{name:"Bryce Ayars",goals:37,year:2025},{name:"Robbie Polk",goals:37,year:2002},{name:"Eric Sigurdson",goals:32,year:1983},{name:"Chris Williams",goals:31,year:2018},{name:"David Roman",goals:31,year:2002},{name:"Will McQueston",goals:31,year:2021},{name:"Zach Smick",goals:30,year:2011}],
  "20 Goal Club":[{name:"Craig Patterson",goals:29,year:1993},{name:"Jack Reistle",goals:28,year:1986},{name:"Greg Conner",goals:27,year:2011},{name:"Randall Clark",goals:27,year:2000},{name:"Trevor Lodge",goals:25,year:2019},{name:"Andrew Blaszczyk",goals:24,year:2015},{name:"Eric Hepler",goals:24,year:2013},{name:"Kevin Shimp",goals:24,year:1991},{name:"Craig Bober",goals:23,year:2005},{name:"Drew Geiger",goals:23,year:2009},{name:"Dean Sorantino",goals:23,year:2021},{name:"Scott Lautenbach",goals:21,year:1980},{name:"Scott Taylor",goals:20,year:1998},{name:"Mickey Demarest",goals:20,year:2014},{name:"Brent Williams",goals:20,year:2023}],
};
const topG=[{n:41,name:"Magnus Ramquist",s:1984},{n:32,name:"Eric Sigurdson",s:1983},{n:29,name:"Oscar Hernandez",s:1999},{n:28,name:"Chase Prater",s:2021},{n:26,name:"Adrian Ibarra",s:2023},{n:26,name:"Geoff Schaefer",s:2015},{n:24,name:"Dan Emmans",s:1989},{n:23,name:"Jeff LaPalomento",s:1996},{n:23,name:"Kevin Udy",s:1984},{n:22,name:"Chris Williams",s:2018},{n:21,name:"Geoff Schaefer",s:2015},{n:21,name:"Robbie Polk",s:2002},{n:21,name:"Jeff LaPalomento",s:1995},{n:20,name:"Oscar Hernandez",s:1997}];
const topA=[{n:22,name:"Will McQueston",s:2021},{n:19,name:"Kevin Udy",s:1983},{n:18,name:"Jake Moore",s:2019},{n:16,name:"David Roman",s:1999},{n:15,name:"David Roman",s:2000},{n:14,name:"Blake Bialecki",s:2023},{n:14,name:"Dean Sorantino",s:2021},{n:14,name:"Chris Williams",s:2018},{n:14,name:"Brian Udy",s:1981},{n:13,name:"Dan Emmans",s:1988},{n:13,name:"Kevin Udy",s:1984},{n:12,name:"Adrian Ibarra",s:2024},{n:12,name:"Sam Lamont",s:1989},{n:11,name:"Steve Demarest",s:1984},{n:11,name:"Brian Udy",s:1980},{n:10,name:"Dean Sorantino",s:2020},{n:10,name:"Chase Prater",s:2021},{n:10,name:"Jake Moore",s:2020},{n:10,name:"Brandon Dean",s:2013},{n:10,name:"Zach Smick",s:2011},{n:10,name:"Greg Conner",s:2011},{n:10,name:"Drew Geiger",s:2009},{n:10,name:"Travis Goss",s:2007},{n:10,name:"Brian Udy",s:1979}];
const HT=[
  {name:"Oscar Hernandez",t:12,y:1999},
  {name:"Jeff LaPalomento",t:6,y:1996},
  {name:"Magnus Ramquist",t:6,y:1984},
  {name:"Chase Prater",t:5,y:2021},
  {name:"Dan Emmans",t:4,y:1989},
  {name:"Eric Sigurdson",t:4,y:1983},
  {name:"Adrian Ibarra",t:2,y:2024},
  {name:"Will McQueston",t:2,y:2021},
  {name:"Chris Williams",t:2,y:2018},
  {name:"Geoff Schaefer",t:2,y:2015},
  {name:"Jesse Norris",t:2,y:2005},
  {name:"Robbie Polk",t:2,y:2002},
  {name:"Tim McHarness",t:2,y:1991},
  {name:"Jack Reistle",t:2,y:1986},
  {name:"Dave Nathans",t:2,y:1984},
  {name:"Kevin Udy",t:2,y:1984},
  {name:"Brian Udy",t:2,y:1981},
  {name:"Bryce Ayars",t:1,y:2025},
  {name:"Brent Williams",t:1,y:2023},
  {name:"Dean Sorantino",t:1,y:2021},
  {name:"Jake Moore",t:1,y:2020},
  {name:"Nate Hitchner",t:1,y:2019},
  {name:"Andrew Blaszczyk",t:1,y:2015},
  {name:"Greg Conner",t:1,y:2011},
  {name:"Drew Geiger",t:1,y:2009},
  {name:"Travis Goss",t:1,y:2007},
  {name:"Baltazar Constantino",t:1,y:2005},
  {name:"Charlie Sanclemente",t:1,y:2003},
  {name:"David Roman",t:1,y:2002},
  {name:"Randall Clark",t:1,y:2000},
  {name:"Scott Haag",t:1,y:1996},
  {name:"Craig Patterson",t:1,y:1993},
  {name:"Herb Weichmann",t:1,y:1990},
  {name:"Dave Burbage",t:1,y:1988},
  {name:"Frank Furfari",t:1,y:1987},
  {name:"Robert Woodruff",t:1,y:1987},
  {name:"Andy Ritchie",t:1,y:1986},
  {name:"Dave Krishna",t:1,y:1983},
  {name:"James Reinhard",t:1,y:1981},
  {name:"Steve Rust",t:1,y:1980},
];
const MS=[{g:1,p:"Garrett Bostwick",d:"10/18/1978",o:"Pitman"},{g:50,p:"Scott Lautenbach",d:"10/16/1980",o:"Pitman"},{g:100,p:"Doug Hathaway",d:"10/3/1981",o:"Moorestown Friends"},{g:150,p:"Dave Krishna",d:"9/26/1983",o:"Glassboro"},{g:200,p:"Kevin Udy",d:"10/28/1983",o:"Kingsway"},{g:250,p:"Magnus Ramquist",d:"9/26/1984",o:"Pitman"},{g:300,p:"Magnus Ramquist",d:"10/24/1984",o:"Clearview"},{g:350,p:"Todd Neaveill",d:"10/23/1985",o:"Williamstown"},{g:400,p:"Dave Moore",d:"10/29/1986",o:"Clearview"},{g:450,p:"Felix Wilkes",d:"10/28/1987",o:"Schalick"},{g:500,p:"Sam Lamont",d:"9/20/1989",o:"Penns Grove"},{g:550,p:"Sean Weiser",d:"10/16/1989",o:"Pitman"},{g:600,p:"Wes Stubbins",d:"10/24/1990",o:"Gloucester City"},{g:650,p:"Andy Ware",d:"9/17/1992",o:"Penns Grove"},{g:700,p:"Jeff LaPalomento",d:"10/11/1993",o:"Glassboro"},{g:750,p:"Jeff LaPalomento",d:"10/15/1994",o:"Clayton"},{g:800,p:"Oscar Hernandez",d:"9/20/1996",o:"Pennsville"},{g:850,p:"Mike DeMarcantonio",d:"10/29/1996",o:"Penns Grove"},{g:900,p:"Scott Taylor",d:"10/22/1997",o:"Pennsville"},{g:950,p:"Oscar Hernandez",d:"10/21/1998",o:"Pennsville"},{g:1000,p:"Oscar Hernandez",d:"10/27/1999",o:"Clayton"},{g:1050,p:"Jose Roman",d:"10/16/2000",o:"Clayton"},{g:1100,p:"Probyn Allen",d:"10/3/2001",o:"Pennsville"},{g:1150,p:"Seth Frost",d:"10/8/2001",o:"Cumberland"},{g:1200,p:"Bryan Shumaker",d:"10/28/2003",o:"Gloucester"},{g:1250,p:"Craig Bober",d:"10/20/2004",o:"Deptford"},{g:1300,p:"Travis Goss",d:"9/11/2006",o:"Penns Grove"},{g:1350,p:"Zach Riley",d:"9/17/2007",o:"Pitman"},{g:1400,p:"TJ Schaefer",d:"10/19/2008",o:"Wildwood"},{g:1450,p:"Mike Love",d:"10/30/2009",o:"Salem"},{g:1500,p:"Kyle Counsellor",d:"10/28/2010",o:"Pennsville"},{g:1550,p:"Dillon Martell",d:"9/10/2012",o:"Deptford"},{g:1600,p:"Geoff Schaefer",d:"9/17/2013",o:"Gloucester Catholic"},{g:1650,p:"Justin Miller",d:"11/1/2013",o:"Penns Grove"},{g:1700,p:"Geoff Schaefer",d:"10/24/2014",o:"Deptford"},{g:1750,p:"Geoff Schaefer",d:"10/14/2015",o:"Cumberland"},{g:1800,p:"Coleman Weatherstone",d:"10/19/2016",o:"Clayton"},{g:1850,p:"Antonio Saughelli",d:"9/21/2018",o:"Wildwood"},{g:1900,p:"Henrik Hoeldtke",d:"9/12/2019",o:"Gloucester City"},{g:1950,p:"Pierce Prater",d:"10/29/2019",o:"Penns Grove"},{g:2000,p:"Kaleb Gerace",d:"11/10/2020",o:"Florence"},{g:2050,p:"Chase Prater",d:"10/14/2021",o:"Overbrook"},{g:2100,p:"Erich Lipovsky",d:"10/12/2022",o:"Pitman"},{g:2150,p:"Blake Bialecki",d:"10/9/2023",o:"Gateway"},{g:2200,p:"Adrian Ibarra",d:"9/30/2024",o:"Pitman"},{g:2250,p:"Enzo Bell-Miller",d:"9/12/2025",o:"Salem Vo-Tech"}];
const BR=[
  {t:72,n:"Schaefer",p:[{name:"TJ Schaefer",y:2009},{name:"Geoff Schaefer",y:2015}]},
  {t:62,n:"Udy",p:[{name:"Kevin Udy",y:1984},{name:"Brian Udy",y:1981}]},
  {t:61,n:"Prater",p:[{name:"Pierce Prater",y:2019},{name:"Chase Prater",y:2021},{name:"Grant Prater",y:2024}]},
  {t:58,n:"Polk",p:[{name:"Robbie Polk",y:2002},{name:"Kevin Polk",y:2009},{name:"Chris Polk",y:2005}]},
  {t:46,n:"Goss",p:[{name:"Travis Goss",y:2007},{name:"DJ Goss",y:2000}]},
  {t:40,n:"Smick",p:[{name:"Zach Smick",y:2011},{name:"Matt Smick",y:2003},{name:"Brandon Smick",y:2006}]},
  {t:36,n:"Roman",p:[{name:"David Roman",y:2002},{name:"Jose Roman",y:2000}]},
  {t:26,n:"Bober",p:[{name:"Craig Bober",y:2005},{name:"Ryan Bober",y:2007}]},
  {t:26,n:"Lodge",p:[{name:"Jacob Lodge",y:2017},{name:"Trevor Lodge",y:2019}]},
  {t:22,n:"McHarness",p:[{name:"Tim McHarness",y:1991},{name:"Matt McHarness",y:1994}]},
  {t:20,n:"Norris",p:[{name:"Jesse Norris",y:2005},{name:"Jason Norris",y:2006},{name:"James Norris",y:1998}]},
  {t:20,n:"Ewart",p:[{name:"Brady Ewart",y:2005},{name:"Brint Ewart",y:2003}]},
  {t:20,n:"Mondragon",p:[{name:"Allan Mondragon",y:2018},{name:"Kevin Mondragon",y:2019}]},
  {t:19,n:"Love",p:[{name:"Mike Love",y:2009},{name:"Pat Love",y:2011},{name:"Dan Love",y:2012}]},
  {t:17,n:"Ritchie",p:[{name:"Andy Ritchie",y:1986},{name:"Brian Ritchie",y:1989}]},
  {t:17,n:"Smith",p:[{name:"Fran Smith",y:2010},{name:"Derek Smith",y:2013}]},
  {t:15,n:"DelMonico",p:[{name:"Paul DelMonico",y:1991},{name:"Nick DelMonico",y:1993}]},
  {t:15,n:"Olbrich",p:[{name:"Justin Olbrich",y:2020},{name:"Josh Olbrich",y:2026}]},
  {t:11,n:"Moore",p:[{name:"Jake Moore",y:2020},{name:"Zac Moore",y:2019}]},
  {t:11,n:"Nguyen",p:[{name:"Quoc Nguyen",y:1984},{name:"Ky Nguyen",y:1986}]},
  {t:10,n:"Tavani",p:[{name:"Michael Tavani",y:2003},{name:"Greg Tavani",y:2006}]},
  {t:9,n:"Lippincott",p:[{name:"Ben Lippincott",y:2025},{name:"Alex Lippincott",y:2025}]},
  {t:8,n:"Denny",p:[{name:"Brian Denny",y:1994},{name:"Dane Denny",y:1997}]},
  {t:8,n:"Varga",p:[{name:"Chris Varga",y:1993},{name:"Andy Varga",y:1996}]},
  {t:6,n:"Varner",p:[{name:"Dylan Varner",y:2015},{name:"Hayden Varner",y:2016}]},
  {t:5,n:"Pedrick",p:[{name:"Barry Pedrick",y:1990},{name:"Kevin Pedrick",y:1990}]},
  {t:5,n:"Bickford",p:[{name:"Mike Bickford",y:1982},{name:"Peter Bickford",y:1983}]},
  {t:5,n:"Weiser",p:[{name:"Sean Weiser",y:1989},{name:"Aaron Weiser",y:1992}]},
  {t:3,n:"Ahl",p:[{name:"Zach Ahl",y:2004},{name:"Josh Ahl",y:1997}]},
  {t:3,n:"Guy",p:[{name:"Derek Guy",y:2015},{name:"Hank Guy",y:2021}]},
];
const FY=[{name:"Kevin Udy",y:1984,fr:4,so:3,jr:15,sr:23,t:45},{name:"Dan Emmans",y:1989,fr:5,so:7,jr:8,sr:24,t:44},{name:"Brian Ritchie",y:1989,fr:1,so:1,jr:2,sr:4,t:8},{name:"Kevin Shimp",y:1991,fr:1,so:3,jr:11,sr:9,t:24},{name:"Ryan Quirk",y:1992,fr:1,so:3,jr:1,sr:10,t:15},{name:"Craig Patterson",y:1993,fr:2,so:6,jr:12,sr:9,t:29},{name:"Jeff LaPalomento",y:1996,fr:5,so:13,jr:21,sr:23,t:62},{name:"Scott Taylor",y:1998,fr:5,so:4,jr:3,sr:8,t:20},{name:"Paul Hughes",y:1998,fr:2,so:3,jr:6,sr:3,t:14},{name:"Oscar Hernandez",y:1999,fr:13,so:20,jr:16,sr:29,t:78},{name:"Craig Bober",y:2005,fr:1,so:7,jr:7,sr:8,t:23},{name:"Travis Goss",y:2007,fr:7,so:8,jr:19,sr:9,t:43},{name:"Drew Geiger",y:2009,fr:2,so:2,jr:6,sr:13,t:23},{name:"Zach Smick",y:2011,fr:4,so:7,jr:11,sr:8,t:30},{name:"Brandon Dean",y:2013,fr:1,so:1,jr:4,sr:7,t:13},{name:"Mickey Demarest",y:2014,fr:2,so:3,jr:8,sr:7,t:20},{name:"Geoff Schaefer",y:2015,fr:5,so:9,jr:26,sr:21,t:61},{name:"Chris Williams",y:2018,fr:1,so:5,jr:3,sr:22,t:31},{name:"Will McQueston",y:2021,fr:1,so:3,jr:11,sr:16,t:31},{name:"Chase Prater",y:2021,fr:1,so:7,jr:8,sr:28,t:44},{name:"Kaleb Gerace",y:2023,fr:3,so:2,jr:4,sr:3,t:12},{name:"Bryce Ayars",y:2025,fr:3,so:7,jr:10,sr:17,t:37},{name:"Ben Lippincott",y:2025,fr:1,so:1,jr:4,sr:1,t:7}];

const TABS=[{id:"search",label:"Player Search"},{id:"club",label:"Goals Club"},{id:"seasons",label:"Season Records"},{id:"hattricks",label:"Hat Tricks"},{id:"milestones",label:"Milestones"},{id:"brothers",label:"Brothers"},{id:"fouryear",label:"4-Year Scorers"},{id:"alumni",label:"Alumni Roster"}];
const NAV=[{id:"home",label:"Home"},{id:"about",label:"About"},{id:"news",label:"News"},{id:"schedule",label:"Schedule"},{id:"records",label:"Records"},{id:"gallery",label:"Gallery"}];

// Design tokens
const T={
  bg:"#080C12",
  s1:"#0A1628",
  s2:"#0D1F35",
  line:"rgba(255,255,255,0.14)",  // visible but still refined
  or:"#E8520A",
  orDim:"rgba(232,82,10,0.12)",
  wh:"#FFFFFF",
  tx:"#F0F4F8",          // primary — near white
  t2:"#B8C8D8",          // secondary — light blue-grey (was too dark)
  t3:"#7A9AB8",          // tertiary — readable muted (was near-invisible)
  t4:"#4A6480",          // disabled — still dim but legible
};
// ─── COUNT-UP ─────────────────────────────────────────────────────────────
function useCountUp(target:number,duration=1800,active:boolean){
  const [v,setV]=useState(0);
  useEffect(()=>{
    if(!active)return; setV(0);
    const t0=performance.now();
    const tick=(now:number)=>{const p=Math.min((now-t0)/duration,1);setV(Math.round((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  },[target,duration,active]);
  return v;
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────
// Eyebrow label — Nike-style tight tracked caps
const EL=({c}:{c:string})=><p style={{fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.or,marginBottom:12,fontWeight:400}}>{c}</p>;
// Section divider line
const Div=()=><div style={{height:"0.5px",backgroundColor:T.line,margin:"0"}}/>;

// Stat tile with count-up
function StatTile({label,raw,active,accent=false}:{label:string;raw:number|string;active:boolean;accent?:boolean}){
  const isN=typeof raw==="number";
  const v=useCountUp(isN?raw as number:0,1600,active&&isN);
  return(
    <div style={{borderTop:`1px solid ${accent?T.or:T.line}`,paddingTop:20,paddingBottom:4}}>
      <div style={{fontFamily:"var(--fb)",fontSize:32,color:T.wh,letterSpacing:"0.02em",lineHeight:1,whiteSpace:"nowrap" as const}}>{isN?v.toLocaleString():raw}</div>
      <div style={{fontFamily:"var(--fb)",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:T.t2,marginTop:8}}>{label}</div>
    </div>
  );
}

// Rank badge
function Rnk({n}:{n:number}){
  const bg=n===1?T.or:n===2?"#1A3A6E":n===3?"#1E2D45":"transparent";
  const border=n>3?`1px solid ${T.line}`:"none";
  return<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",backgroundColor:bg,border,color:n>3?T.t3:T.wh,fontSize:10,fontWeight:700,fontFamily:"var(--fd)",flexShrink:0}}>{n}</span>;
}

// Data row — clean, no box
function Row({rank,name,value,sub}:{rank:number;name:string;value:number|string;sub:string|number}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`0.5px solid ${T.line}`}}>
      <Rnk n={rank}/>
      <span style={{flex:1,fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500,letterSpacing:"-0.01em"}}>{name}</span>
      <span style={{fontFamily:"var(--fb)",fontSize:22,color:T.or,letterSpacing:"0.04em",minWidth:36,textAlign:"right" as const}}>{value}</span>
      <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,minWidth:32,textAlign:"right" as const}}>{sub}</span>
    </div>
  );
}

// Section wrapper — generous padding, Apple-style breathing room
function Sec({id,bg,children,refFn}:{id:string;bg?:string;children:React.ReactNode;refFn:(el:HTMLElement|null)=>void}){
  return<section id={id} ref={refFn} style={{backgroundColor:bg||T.bg,padding:"96px 0"}}>{children}</section>;
}
const Wrap=({children}:{children:React.ReactNode})=><div style={{maxWidth:1080,margin:"0 auto",padding:"0 24px"}}>{children}</div>;

// Table header cell
const TH=({c,right=false}:{c:string;right?:boolean})=>(
  <th style={{textAlign:right?"right" as const:"left" as const,padding:"0 16px 12px 0",fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase" as const,color:T.t2,borderBottom:`0.5px solid ${T.line}`,fontWeight:400}}>{c}</th>
);

// Grouped stat section (replaces Card)
function Group({title,children}:{title?:string;children:React.ReactNode}){
  return(
    <div style={{marginBottom:40}}>
      {title&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:2,height:16,backgroundColor:T.or}}/>
        <span style={{fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase" as const,color:T.t2}}>{title}</span>
      </div>}
      {children}
    </div>
  );
}

// ─── PLAYER SEARCH ────────────────────────────────────────────────────────
function PlayerSearch(){
  const [q,setQ]=useState("");
  const [res,setRes]=useState<{name:string;info?:typeof alumni[0];stats?:typeof CS[string]}[]>([]);
  useEffect(()=>{
    if(q.trim().length<2){setRes([]);return;}
    const ql=q.toLowerCase();
    const found:typeof res=[];
    alumni.forEach(a=>{
      const full=`${a.f} ${a.l}`.toLowerCase();
      if(full.includes(ql)||a.l.toLowerCase().includes(ql)||a.f.toLowerCase().includes(ql))
        found.push({name:`${a.f} ${a.l}`,info:a,stats:CS[`${a.f} ${a.l}`]});
    });
    setRes(found.slice(0,6));
  },[q]);
  return(
    <Group>
      <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:24,lineHeight:1.7,maxWidth:520}}>Enter any player&rsquo;s name to pull their complete career statistics from program history.</p>
      <div style={{position:"relative",marginBottom:32}}>
        <input type="text" placeholder="Player name..." value={q} onChange={e=>setQ(e.target.value)}
          style={{width:"100%",boxSizing:"border-box" as const,padding:"16px 52px 16px 20px",backgroundColor:T.s1,border:`1px solid ${q.length>0?T.or:"rgba(255,255,255,0.2)"}`,borderRadius:4,color:T.wh,fontFamily:"var(--fd)",fontSize:16,outline:"none",transition:"border-color 0.2s",letterSpacing:"-0.01em"}}/>
        <svg style={{position:"absolute",right:18,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.t2} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      {q.length>=2&&res.length===0&&<p style={{color:T.t2,fontFamily:"var(--fd)",fontSize:14,padding:"24px 0"}}>No player found for &ldquo;{q}&rdquo;</p>}
      {res.map((r,i)=>{
        const s=r.stats;
        return(
          <div key={i} style={{borderTop:`0.5px solid ${T.line}`,padding:"28px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:s&&s.total>0?24:8}}>
              <div>
                <h3 style={{fontFamily:"var(--fb)",fontSize:32,color:T.wh,letterSpacing:"0.04em",lineHeight:1}}>{r.name}</h3>
                <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginTop:6}}>
                  {r.info?`Years: ${r.info.y}`:"Woodstown Boys Soccer"}{s?` · Class of ${s.yr}`:""}
                </p>
              </div>
              {s&&s.total>0&&<div style={{textAlign:"right" as const}}>
                <div style={{fontFamily:"var(--fb)",fontSize:56,color:T.or,lineHeight:1,letterSpacing:"0.02em"}}>{s.total}</div>
                <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.t2,letterSpacing:"0.2em",textTransform:"uppercase" as const,marginTop:4}}>Career Goals</div>
              </div>}
            </div>
            {s&&s.total>0?(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,marginBottom:16}}>
                  {[{lb:"Freshman",v:s.fr},{lb:"Sophomore",v:s.so},{lb:"Junior",v:s.jr},{lb:"Senior",v:s.sr}].map(c=>(
                    <div key={c.lb} style={{backgroundColor:T.s1,padding:"14px 12px",textAlign:"center" as const}}>
                      <div style={{fontFamily:"var(--fb)",fontSize:28,color:typeof c.v==="number"?T.wh:T.t4,letterSpacing:"0.02em"}}>{c.v??"\u2014"}</div>
                      <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.t2,letterSpacing:"0.18em",textTransform:"uppercase" as const,marginTop:6}}>{c.lb}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                  {s.ast&&<span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,border:`0.5px solid ${T.line}`,padding:"5px 12px",borderRadius:20}}>{s.ast} career assists</span>}
                  {s.ht&&<span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,border:`0.5px solid ${T.line}`,padding:"5px 12px",borderRadius:20}}>{s.ht} hat trick{s.ht>1?"s":""}</span>}
                  {s.total>=20&&<span style={{fontFamily:"var(--fd)",fontSize:12,color:T.or,border:`0.5px solid ${T.or}`,padding:"5px 12px",borderRadius:20,backgroundColor:T.orDim}}>{s.total>=70?"70 Goal Club":s.total>=60?"60 Goal Club":s.total>=40?"40 Goal Club":s.total>=30?"30 Goal Club":"20 Goal Club"}</span>}
                </div>
              </>
            ):<p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,fontStyle:"italic"}}>Varsity appearance — detailed scoring stats not on record</p>}
          </div>
        );
      })}
      {q.length<2&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,marginTop:8}}>
          {[{lb:"Total Players",v:"270+"},{lb:"All-Time Goals",v:"2,281"},{lb:"Seasons of History",v:"47"}].map(s=>(
            <div key={s.lb} style={{backgroundColor:T.s1,padding:"20px 18px",borderTop:`1px solid ${T.line}`}}>
              <div style={{fontFamily:"var(--fb)",fontSize:32,color:T.wh,letterSpacing:"0.02em"}}>{s.v}</div>
              <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.t2,letterSpacing:"0.2em",textTransform:"uppercase" as const,marginTop:8}}>{s.lb}</div>
            </div>
          ))}
        </div>
      )}
    </Group>
  );
}

// ─── ALUMNI ───────────────────────────────────────────────────────────────
function AlumniTab(){
  const [q,setQ]=useState("");
  const list=alumni.filter(a=>`${a.f} ${a.l} ${a.y}`.toLowerCase().includes(q.toLowerCase()));
  return(
    <div>
      <input type="text" placeholder="Filter by name or year..." value={q} onChange={e=>setQ(e.target.value)}
        style={{width:"100%",boxSizing:"border-box" as const,padding:"14px 18px",backgroundColor:T.s1,border:`0.5px solid ${T.line}`,borderRadius:4,color:T.wh,fontFamily:"var(--fd)",fontSize:14,outline:"none",marginBottom:8,letterSpacing:"-0.01em"}}/>
      <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:24}}>{list.length} of {alumni.length} players</p>
      <div style={{maxHeight:500,overflowY:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <TH c="Last Name"/><TH c="First Name"/><TH c="Years"/>
          </tr></thead>
          <tbody>{list.map((a,i)=>(
            <tr key={i} style={{borderBottom:`0.5px solid ${T.line}`}}>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500}}>{a.l}</td>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{a.f}</td>
              <td style={{padding:"10px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{a.y}</td>
            </tr>
          ))}
          {list.length===0&&<tr><td colSpan={3} style={{padding:"32px 0",textAlign:"center" as const,color:T.t2,fontFamily:"var(--fd)",fontSize:13}}>No results</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────
function Gallery(){
  const slots=Array.from({length:12});
  const [pos,setPos]=useState(0);
  const W=296;
  const maxP=(slots.length-4)*W;
  const slide=useCallback((d:number)=>setPos(p=>Math.max(0,Math.min(maxP,p+d*W))),[maxP]);
  useEffect(()=>{const id=setInterval(()=>setPos(p=>p>=maxP?0:p+W),4000);return()=>clearInterval(id);},[maxP]);
  return(
    <section id="gallery" style={{backgroundColor:T.s1,padding:"96px 0",overflow:"hidden"}}>
      <Wrap>
        <EL c="Photo Gallery"/>
        <h2 style={{fontFamily:"var(--fb)",fontSize:52,color:T.wh,letterSpacing:"0.04em",lineHeight:1,marginBottom:8}}>Team Gallery</h2>
        <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:48}}>Upload photos to <code style={{fontSize:17,color:T.t2}}>/public/gallery/</code> to populate.</p>
      </Wrap>
      <div style={{overflow:"hidden"}}>
        <div style={{display:"flex",gap:3,transform:`translateX(calc(-${pos}px + 24px))`,transition:"transform 0.7s cubic-bezier(0.4,0,0.2,1)"}}>
          {slots.map((_,i)=>(
            <div key={i} style={{flexShrink:0,width:W-3,height:220,backgroundColor:T.bg,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px)"}}/>
              <div style={{textAlign:"center" as const,position:"relative",zIndex:1}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.t4} strokeWidth="1" style={{display:"block",margin:"0 auto 10px"}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                <span style={{fontFamily:"var(--fb)",fontSize:9,color:T.t4,letterSpacing:"0.18em",textTransform:"uppercase" as const}}>Photo {i+1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:24,padding:"0 24px"}}>
        {[-1,1].map(d=>(
          <button key={d} onClick={()=>slide(d)} style={{width:40,height:40,backgroundColor:"transparent",border:`0.5px solid ${T.line}`,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"border-color 0.15s"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.t2} strokeWidth="1.5">{d===-1?<path d="m15 18-6-6 6-6"/>:<path d="m9 18 6-6-6-6"/>}</svg>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── TWITTER ──────────────────────────────────────────────────────────────
function TwitterFeed(){
  useEffect(()=>{
    if(document.getElementById("tw-w")){if((window as any).twttr)(window as any).twttr.widgets.load();return;}
    const s=document.createElement("script");s.id="tw-w";s.src="https://platform.twitter.com/widgets.js";s.async=true;s.charset="utf-8";document.body.appendChild(s);
  },[]);
  return<a className="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="5" data-link-color="#E8520A" href="https://twitter.com/woodstownsoccer">Loading @woodstownsoccer...</a>;
}
// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function Home(){
  const [tab,setTab]=useState("search");
  const [nav,setNav]=useState("home");
  const [menu,setMenu]=useState(false);
  const [heroSeen,setHeroSeen]=useState(false);
  const refs=useRef<Record<string,HTMLElement|null>>({});

  const go=(id:string)=>{
    const el=refs.current[id];
    if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:"smooth"});
    setMenu(false);
  };

  useEffect(()=>{
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setNav(e.target.id);}),{threshold:0.15,rootMargin:"-64px 0px -60% 0px"});
    Object.values(refs.current).forEach(el=>el&&obs.observe(el));
    return()=>obs.disconnect();
  },[]);

  useEffect(()=>{
    const el=refs.current.home;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setHeroSeen(true)},{threshold:0.3});
    obs.observe(el);return()=>obs.disconnect();
  },[]);

  const s=season;
  const winPct=((s.record.w+s.record.t*0.5)/(s.record.w+s.record.l+s.record.t)*100).toFixed(0);

  const tabs:Record<string,React.ReactNode>={
    search:<PlayerSearch/>,
    club:<div>{Object.entries(CGC).map(([cl,pl])=>(
      <Group key={cl} title={cl}>{pl.map((p,i)=><Row key={i} rank={i+1} name={p.name} value={p.goals} sub={p.year}/>)}</Group>
    ))}</div>,
    seasons:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:48}}>
      <Group title="Most Goals in a Season">{topG.map((p,i)=><Row key={i} rank={i+1} name={p.name} value={p.n} sub={p.s}/>)}</Group>
      <Group title="Most Assists in a Season">{topA.map((p,i)=><Row key={i} rank={i+1} name={p.name} value={p.n} sub={p.s}/>)}</Group>
    </div>,
    hattricks:<Group title="Career Hat Tricks — All-Time Leaders">{HT.map((p,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`0.5px solid ${T.line}`}}>
        <Rnk n={i+1}/>
        <span style={{flex:1,fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500,letterSpacing:"-0.01em"}}>{p.name}</span>
        <div style={{display:"flex",gap:2,marginRight:8}}>{Array.from({length:Math.min(p.t,12)}).map((_,j)=><div key={j} style={{width:7,height:7,borderRadius:"50%",backgroundColor:j===0?T.or:"rgba(232,82,10,0.25)"}}/>)}</div>
        <span style={{fontFamily:"var(--fb)",fontSize:20,color:T.or,letterSpacing:"0.04em",minWidth:28,textAlign:"right" as const}}>{p.t}</span>
        <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,minWidth:32,textAlign:"right" as const}}>{p.y}</span>
      </div>
    ))}</Group>,
    milestones:<Group title="Program Milestone Goals — #1 (1978) through #2,250 (2025)">
      <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:20,lineHeight:1.6}}>Every 50th goal scored in program history. Highlighted rows mark 500-goal milestones.</p>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:440}}>
          <thead><tr><TH c="Goal #"/><TH c="Player"/><TH c="Date"/><TH c="Opponent"/></tr></thead>
          <tbody>{MS.map((m,i)=>{const big=m.g%500===0;return(
            <tr key={i} style={{backgroundColor:big?"rgba(232,82,10,0.06)":"transparent",borderBottom:`0.5px solid ${T.line}`}}>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fb)",fontSize:big?18:14,color:big?T.or:T.t2,letterSpacing:"0.04em"}}>#{m.g.toLocaleString()}</td>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500}}>{m.p}</td>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{m.d}</td>
              <td style={{padding:"10px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{m.o}</td>
            </tr>
          );})}</tbody>
        </table>
      </div>
    </Group>,
    brothers:<div>
      <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:32,lineHeight:1.7}}>Combined career goal totals for brothers who played for Woodstown.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:1}}>
        {BR.map((b,i)=>(
          <div key={i} style={{backgroundColor:T.s1,padding:"24px 20px",borderTop:`1px solid ${i<3?T.or:T.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Rnk n={i+1}/><span style={{fontFamily:"var(--fb)",fontSize:18,color:T.wh,letterSpacing:"0.06em"}}>{b.n} Family</span></div>
              <span style={{fontFamily:"var(--fb)",fontSize:36,color:T.or,letterSpacing:"0.02em"}}>{b.t}</span>
            </div>
            <div style={{borderTop:`0.5px solid ${T.line}`,paddingTop:12}}>
              {b.p.map((pl,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{pl.name}</span>
                <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>Class of {pl.y}</span>
              </div>)}
            </div>
          </div>
        ))}
      </div>
    </div>,
    fouryear:<Group title={`Scored in All Four Years — ${FY.length} Players`}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
          <thead><tr><TH c="#"/><TH c="Player"/><TH c="Fr" right/><TH c="So" right/><TH c="Jr" right/><TH c="Sr" right/><TH c="Total" right/><TH c="Class" right/></tr></thead>
          <tbody>{FY.map((p,i)=>(
            <tr key={i} style={{borderBottom:`0.5px solid ${T.line}`}}>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{i+1}</td>
              <td style={{padding:"10px 16px 10px 0",fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500}}>{p.name}</td>
              {[p.fr,p.so,p.jr,p.sr].map((v,j)=><td key={j} style={{padding:"10px 16px 10px 0",textAlign:"right" as const,fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{v}</td>)}
              <td style={{padding:"10px 16px 10px 0",textAlign:"right" as const,fontFamily:"var(--fb)",fontSize:20,color:T.or,letterSpacing:"0.04em"}}>{p.t}</td>
              <td style={{padding:"10px 0",textAlign:"right" as const,fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{p.y}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Group>,
    alumni:<AlumniTab/>,
  };

  return(
    <div style={{backgroundColor:T.bg,minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        :root{--fb:'Bebas Neue',Impact,sans-serif;--fd:'DM Sans',system-ui,sans-serif;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}body{background:${T.bg};}
        input::placeholder{color:${T.t4};}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
        /* Mobile */
        @media(max-width:768px){
          .hide-mobile{display:none!important;}
          .show-mobile{display:flex!important;}
          .grid-1{grid-template-columns:1fr!important;}
          .grid-2{grid-template-columns:1fr 1fr!important;}
          .hero-title{font-size:clamp(60px,16vw,96px)!important;}
          .hero-inner{padding:64px 0 40px!important;flex-direction:column!important;gap:40px!important;}
          .hero-logo{width:120px!important;height:120px!important;}
          .stat-grid{grid-template-columns:1fr 1fr!important;}
          .section-pad{padding:64px 0!important;}
          .news-grid{grid-template-columns:1fr!important;}
          .schedule-grid{grid-template-columns:1fr 1fr!important;}
          .player-grid{grid-template-columns:1fr 1fr!important;}
          .footer-grid{grid-template-columns:1fr!important;gap:40px!important;}
          .tab-scroll{-webkit-overflow-scrolling:touch;}
        }
        @media(max-width:480px){
          .stat-grid{grid-template-columns:1fr 1fr!important;}
          .schedule-grid{grid-template-columns:1fr 1fr!important;}
          .player-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* ── NAV — frosted glass, Apple-style ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,backgroundColor:"rgba(8,12,18,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`0.5px solid ${T.line}`,height:60}}>
        <div style={{maxWidth:1080,margin:"0 auto",padding:"0 24px",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:0}}>
            <Image src="/logo.jpg" alt="Woodstown Boys Soccer" width={36} height={36} style={{borderRadius:"50%",border:`1.5px solid ${T.or}`}}/>
            <div className="hide-mobile">
              <div style={{fontFamily:"var(--fb)",fontSize:14,color:T.wh,letterSpacing:"0.14em",lineHeight:1}}>WOODSTOWN</div>
              <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.or,letterSpacing:"0.22em",textTransform:"uppercase",marginTop:2}}>BOYS SOCCER</div>
            </div>
          </button>
          {/* Desktop nav — Apple nav pill style */}
          <div className="hide-mobile" style={{display:"flex",alignItems:"center",gap:4}}>
            {NAV.map(l=>(
              <button key={l.id} onClick={()=>go(l.id)} style={{padding:"6px 14px",fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase" as const,border:"none",borderRadius:20,cursor:"pointer",backgroundColor:nav===l.id?"rgba(232,82,10,0.15)":"transparent",color:nav===l.id?T.or:T.t2,transition:"all 0.2s"}}>{l.label}</button>
            ))}
          </div>
          {/* Mobile hamburger */}
          <button className="show-mobile" onClick={()=>setMenu(!menu)} style={{background:"none",border:`0.5px solid ${T.line}`,borderRadius:6,cursor:"pointer",display:"none",flexDirection:"column" as const,gap:4,padding:"8px 10px"}}>
            <div style={{width:18,height:1.5,backgroundColor:menu?T.or:T.wh,transition:"background 0.2s"}}/>
            <div style={{width:18,height:1.5,backgroundColor:menu?T.or:T.wh,transition:"background 0.2s"}}/>
            <div style={{width:18,height:1.5,backgroundColor:menu?T.or:T.wh,transition:"background 0.2s"}}/>
          </button>
        </div>
        {menu&&(
          <div style={{backgroundColor:"rgba(8,12,18,0.97)",backdropFilter:"blur(20px)",borderTop:`0.5px solid ${T.line}`,padding:"8px 0 16px"}}>
            {NAV.map(l=>(
              <button key={l.id} onClick={()=>go(l.id)} style={{display:"block",width:"100%",textAlign:"left" as const,padding:"14px 24px",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontSize:13,letterSpacing:"0.2em",textTransform:"uppercase" as const,color:nav===l.id?T.or:T.t2,transition:"color 0.15s"}}>{l.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO — full-bleed, bold, minimal ── */}
      <section id="home" ref={el=>{refs.current.home=el;}} style={{backgroundColor:T.s1,paddingTop:60,minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}>
        {/* Subtle noise texture feel via repeating gradient */}
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 80% 60% at 70% 50%, rgba(232,82,10,0.06) 0%, transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:"0.5px",backgroundColor:T.or,opacity:0.4}}/>
        <Wrap>
          <div className="hero-inner" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:60,padding:"80px 0 60px",position:"relative",zIndex:1}}>
            <div style={{flex:1,minWidth:0}}>
              {/* Mobile-only: logo sits above the title */}
              <div className="show-mobile" style={{display:"none",justifyContent:"center",marginBottom:32}}>
                <div style={{position:"relative",width:110,height:110}}>
                  <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:`0.5px solid ${T.line}`}}/>
                  <Image src="/logo.jpg" alt="Woodstown Boys Soccer" fill style={{objectFit:"contain",borderRadius:"50%",border:`2px solid ${T.or}`}}/>
                </div>
              </div>
              {/* Nike-style eyebrow */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:28,border:`0.5px solid rgba(255,255,255,0.2)`,borderRadius:20,padding:"6px 14px"}}>
                <div style={{width:5,height:5,backgroundColor:T.or,borderRadius:"50%"}}/>
                <span style={{fontFamily:"var(--fb)",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.t2}}>Est. 1978 · Woodstown, NJ</span>
              </div>
              <h1 className="hero-title" style={{fontFamily:"var(--fb)",fontSize:"clamp(64px,8.5vw,108px)",fontWeight:400,color:T.wh,letterSpacing:"0.02em",lineHeight:0.92,marginBottom:4}}>WOODSTOWN</h1>
              <h2 className="hero-title" style={{fontFamily:"var(--fb)",fontSize:"clamp(64px,8.5vw,108px)",fontWeight:400,color:T.or,letterSpacing:"0.02em",lineHeight:0.92,marginBottom:32}}>BOYS SOCCER</h2>
              <p style={{fontFamily:"var(--fb)",fontSize:13,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.t2,marginBottom:48}}>Tri-County Conference · Diamond Division · NJSIAA Group I</p>
              {/* Count-up stat grid */}
              <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,marginBottom:48,maxWidth:520}}>
                <StatTile label="All-Time Record" raw="484-347-56" active={heroSeen}/>
                <StatTile label="Program Goals" raw={2281} active={heroSeen} accent/>
                <StatTile label="Conf. Titles" raw={9} active={heroSeen} accent/>
                <StatTile label="Seasons" raw={47} active={heroSeen}/>
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap" as const}}>
                <button onClick={()=>go("records")} style={{padding:"14px 28px",backgroundColor:T.or,color:T.wh,border:"none",fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.18em",textTransform:"uppercase" as const,cursor:"pointer",borderRadius:2,transition:"opacity 0.15s"}}>Records & Stats</button>
                <button onClick={()=>go("schedule")} style={{padding:"14px 28px",backgroundColor:"transparent",color:T.t2,border:`1px solid rgba(255,255,255,0.25)`,fontFamily:"var(--fb)",fontSize:12,letterSpacing:"0.18em",textTransform:"uppercase" as const,cursor:"pointer",borderRadius:2,transition:"all 0.15s"}}>2025-26 Season</button>
              </div>
            </div>
            {/* Logo — clean ring treatment, hidden on mobile (shown above title instead) */}
            <div className="hero-logo hide-mobile" style={{flexShrink:0,width:200,height:200,position:"relative"}}>
              <div style={{position:"absolute",inset:-12,borderRadius:"50%",border:`0.5px solid ${T.line}`}}/>
              <div style={{position:"absolute",inset:-24,borderRadius:"50%",border:`0.5px solid rgba(255,255,255,0.04)`}}/>
              <Image src="/logo.jpg" alt="Woodstown Boys Soccer" fill style={{objectFit:"contain",borderRadius:"50%",border:`2px solid ${T.or}`}}/>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ── ABOUT ── */}
      <Sec id="about" refFn={el=>{refs.current.about=el;}}>
        <Wrap>
          <EL c="Program History"/>
          <h2 style={{fontFamily:"var(--fb)",fontSize:56,color:T.wh,letterSpacing:"0.04em",lineHeight:1,marginBottom:48}}>About the Program</h2>
          <div className="grid-1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"start"}}>
            <div>
              <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,lineHeight:1.8,marginBottom:20,letterSpacing:"-0.01em"}}>The Woodstown High School Boys Soccer Program was founded in 1978. A Group I South Jersey Program in the Tri-County Conference — Diamond Division and member of the NJSIAA.</p>
              <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,lineHeight:1.8,letterSpacing:"-0.01em"}}>After 47 seasons: a record of 484-347-56, 9 Conference Championships, and 2,281 goals scored by more than 270 student-athletes.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1}}>
              {[{lb:"Goals Scored",v:"2,281",a:true},{lb:"Assists Recorded",v:"1,646",a:true},{lb:"Keeper Shutouts",v:"249"},{lb:"Keepers w/ Varsity Win",v:"32"},{lb:"Players w/ Varsity Goal",v:"291"},{lb:"Players w/ Varsity Assist",v:"273"}].map((s,i)=>(
                <div key={s.lb} style={{backgroundColor:T.s1,padding:"20px 18px",borderTop:`1px solid ${(s as any).a?T.or:T.line}`}}>
                  <div style={{fontFamily:"var(--fb)",fontSize:32,color:T.wh,letterSpacing:"0.02em"}}>{s.v}</div>
                  <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.t2,letterSpacing:"0.2em",textTransform:"uppercase" as const,marginTop:8,lineHeight:1.5}}>{s.lb}</div>
                </div>
              ))}
            </div>
          </div>
        </Wrap>
      </Sec>

      <Div/>

      {/* ── NEWS ── */}
      <Sec id="news" bg={T.s1} refFn={el=>{refs.current.news=el;}}>
        <Wrap>
          <EL c="Latest News"/>
          <h2 style={{fontFamily:"var(--fb)",fontSize:56,color:T.wh,letterSpacing:"0.04em",lineHeight:1,marginBottom:48}}>News & Announcements</h2>
          <div className="news-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64}}>
            <div>
              <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:28,lineHeight:1.7}}>
                Live from <a href="https://twitter.com/woodstownsoccer" target="_blank" rel="noopener noreferrer" style={{color:T.or,textDecoration:"none",fontWeight:600}}>@woodstownsoccer</a>. Coach tweets — it auto-populates here.
              </p>
              <TwitterFeed/>
            </div>
            <div>
              <div style={{borderTop:`1px solid ${T.or}`,paddingTop:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <span style={{fontFamily:"var(--fb)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.or}}>Program Update</span>
                  <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>Jan 10, 2026</span>
                </div>
                <h3 style={{fontFamily:"var(--fb)",fontSize:24,color:T.wh,letterSpacing:"0.04em",marginBottom:14}}>Woodstown Boys Soccer Program</h3>
                <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,lineHeight:1.8,marginBottom:20,letterSpacing:"-0.01em"}}>Founded 1978. Group I South Jersey, Tri-County Conference Diamond Division. Record: 484-347-56 · 9 Conference Championships.</p>
                <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
                  {["2,238 Goals Scored","1,646 Assists Recorded","249 Keeper Shutouts","291 Players with a Varsity Goal"].map(item=>(
                    <div key={item} style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:3,height:3,backgroundColor:T.or,borderRadius:"50%",flexShrink:0}}/>
                      <span style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Wrap>
      </Sec>

      <Div/>

      {/* ── SCHEDULE ── */}
      <Sec id="schedule" refFn={el=>{refs.current.schedule=el;}}>
        <Wrap>
          <EL c="2025–26 Season"/>
          <h2 style={{fontFamily:"var(--fb)",fontSize:56,color:T.wh,letterSpacing:"0.04em",lineHeight:1,marginBottom:12}}>Schedule & Results</h2>
          <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:40}}>
            Source: <a href="https://www.maxpreps.com/nj/woodstown/woodstown-wolverines/soccer/schedule/" target="_blank" rel="noopener noreferrer" style={{color:T.or,textDecoration:"none"}}>MaxPreps</a>
            &nbsp;· League record: {s.league.w}-{s.league.l}-{s.league.t} · {s.league.standing}
          </p>
          {/* Season summary */}
          <div className="schedule-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,marginBottom:48,maxWidth:560}}>
            {[{lb:"Overall",v:`${s.record.w}-${s.record.l}-${s.record.t}`},{lb:"Win %",v:`${winPct}%`},{lb:"League",v:`${s.league.w}-${s.league.l}-${s.league.t}`},{lb:"Goals For",v:`${s.gf}`},{lb:"Goals Against",v:`${s.ga}`}].map(st=>(
              <div key={st.lb} style={{backgroundColor:T.s1,padding:"16px 12px",borderTop:`1px solid ${T.or}`,textAlign:"center" as const}}>
                <div style={{fontFamily:"var(--fb)",fontSize:20,color:T.wh,letterSpacing:"0.04em"}}>{st.v}</div>
                <div style={{fontFamily:"var(--fb)",fontSize:9,color:T.t2,letterSpacing:"0.18em",textTransform:"uppercase" as const,marginTop:6}}>{st.lb}</div>
              </div>
            ))}
          </div>
          {/* Game results */}
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:420}}>
              <thead><tr><TH c="Date"/><TH c="Opponent"/><TH c="H/A"/><TH c="Result"/><TH c="Score" right/></tr></thead>
              <tbody>{s.games.map((g,i)=>{
                const rc=g.r==="W"?"#34D399":g.r==="L"?"#F87171":T.t2;
                return<tr key={i} style={{borderBottom:`0.5px solid ${T.line}`,backgroundColor:g.po?"rgba(232,82,10,0.04)":"transparent"}}>
                  <td style={{padding:"11px 16px 11px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2,whiteSpace:"nowrap" as const}}>{g.date}</td>
                  <td style={{padding:"11px 16px 11px 0",fontFamily:"var(--fd)",fontSize:15,color:T.tx,fontWeight:500,letterSpacing:"-0.01em"}}>
                    {g.opp}
                    {g.lg&&<span style={{marginLeft:7,fontSize:9,color:T.t2,border:`1px solid rgba(255,255,255,0.2)`,padding:"2px 5px",borderRadius:3,letterSpacing:"0.1em",fontFamily:"var(--fb)"}}>LG</span>}
                    {g.po&&<span style={{marginLeft:7,fontSize:9,color:T.or,border:`0.5px solid ${T.or}`,padding:"2px 5px",borderRadius:3,letterSpacing:"0.1em",fontFamily:"var(--fb)"}}>PO</span>}
                  </td>
                  <td style={{padding:"11px 16px 11px 0",fontFamily:"var(--fd)",fontSize:17,color:T.t2}}>{g.ha}</td>
                  <td style={{padding:"11px 16px 11px 0"}}><span style={{fontFamily:"var(--fb)",fontSize:18,color:rc,letterSpacing:"0.08em"}}>{g.r}</span></td>
                  <td style={{padding:"11px 0",textAlign:"right" as const,fontFamily:"var(--fb)",fontSize:17,color:T.t2,letterSpacing:"0.06em"}}>
                    {g.gs}–{g.ga}{g.note&&<span style={{fontFamily:"var(--fd)",fontSize:10,color:T.t2,marginLeft:4}}>{g.note}</span>}
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </Wrap>
      </Sec>

      <Div/>

      {/* ── RECORDS ── */}
      <Sec id="records" bg={T.s1} refFn={el=>{refs.current.records=el;}}>
        <Wrap>
          <EL c="Historical Data"/>
          <h2 style={{fontFamily:"var(--fb)",fontSize:56,color:T.wh,letterSpacing:"0.04em",lineHeight:1,marginBottom:8}}>Records & Stats</h2>
          <p style={{fontFamily:"var(--fd)",fontSize:17,color:T.t2,marginBottom:32,letterSpacing:"-0.01em"}}>47 years · {alumni.length}+ players · 2,281 goals and counting.</p>
          {/* Sticky tab bar — ultra-clean */}
          <div style={{position:"sticky",top:60,zIndex:50,backgroundColor:T.s1,paddingBottom:16,paddingTop:12,marginBottom:32,borderBottom:`0.5px solid ${T.line}`}}>
            <div className="tab-scroll" style={{display:"flex",gap:2,overflowX:"auto"}}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",fontFamily:"var(--fb)",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,backgroundColor:tab===t.id?T.or:"transparent",color:tab===t.id?T.wh:T.t2,border:tab===t.id?"none":`1px solid rgba(255,255,255,0.18)`,borderRadius:20,cursor:"pointer",whiteSpace:"nowrap" as const,flexShrink:0,transition:"all 0.2s"}}>{t.label}</button>
              ))}
            </div>
          </div>
          {tabs[tab]}
        </Wrap>
      </Sec>

      {/* ── GALLERY ── */}
      <Gallery/>

      {/* ── FOOTER ── */}
      <footer style={{backgroundColor:T.bg,borderTop:`0.5px solid ${T.line}`,padding:"56px 0 32px"}}>
        <Wrap>
          <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:48,marginBottom:48}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <Image src="/logo.jpg" alt="Woodstown Boys Soccer" width={32} height={32} style={{borderRadius:"50%",border:`1.5px solid ${T.or}`}}/>
                <span style={{fontFamily:"var(--fb)",fontSize:13,color:T.wh,letterSpacing:"0.12em"}}>WOODSTOWN BOYS SOCCER</span>
              </div>
              <p style={{fontFamily:"var(--fd)",fontSize:12,color:T.t4,lineHeight:2}}>Est. 1978 · Woodstown High School<br/>Woodstown, NJ<br/>Tri-County Conference — Diamond Division<br/>NJSIAA Group I South Jersey</p>
            </div>
            <div>
              <p style={{fontFamily:"var(--fb)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.t2,marginBottom:16}}>Navigation</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 0"}}>
                {NAV.map(l=><button key={l.id} onClick={()=>go(l.id)} style={{textAlign:"left" as const,background:"none",border:"none",cursor:"pointer",fontFamily:"var(--fd)",fontSize:17,color:T.t2,padding:"2px 0",letterSpacing:"-0.01em"}}>{l.label}</button>)}
              </div>
            </div>
            <div>
              <p style={{fontFamily:"var(--fb)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.t2,marginBottom:16}}>Conference Titles</p>
              <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                {[1981,1983,1984,1989,1999,2009,2011,2013,2014].map(y=>(
                  <div key={y} style={{border:`0.5px solid ${T.line}`,borderRadius:20,padding:"4px 12px",fontFamily:"var(--fb)",fontSize:17,color:T.t2,letterSpacing:"0.08em"}}>{y}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{borderTop:`0.5px solid ${T.line}`,paddingTop:24,textAlign:"center" as const}}>
            <p style={{fontFamily:"var(--fd)",fontSize:11,color:T.t4,letterSpacing:"0.02em"}}>Woodstown High School Boys Soccer · Statistics compiled by program historians · Data current through 2025 season</p>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
