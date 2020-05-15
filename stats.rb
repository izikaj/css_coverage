require 'bundler'
require 'json'
require 'pry'
require 'hashie'
require 'fileutils'

def heat_map(src)
  amount = src.ranges.size
  step = (amount * 0.01).floor
  map = Array.new(src.content.size, 0)

  src.ranges.each_with_index do |range, cursor|
    puts "#{cursor}/#{amount}" if step.positive? && (cursor % step).zero?
    ((range.start)...(range.end)).each do |curr|
      map[curr] ||= 0
      map[curr] += 1
    end
  end

  map
end

def new_ranges(hmap, rate = 1)
  mask = hmap.map { |v| v >= rate ? 1 : 0 }.join('')
  reg = /1+/
  ranges = []
  position = 0

  loop do
    match = reg.match(mask, position)
    break if match.nil?

    ranges << Hashie::Mash.new({start: match.begin(0), end: match.end(0)})
    position = match.end(0)
  end

  ranges
end

def extract(content, ranges = [])
  buffer = ''

  ranges.each do |range|
    buffer << content[(range.start)...(range.end)]
  end

  buffer
end

def store(name, content)
  File.write(File.join('dist', name), content)
end

def breakpoints(hmap)
  max = hmap.max
  prev = hmap.size
  points = [[0, prev]]
  40.times.to_a.map { |amount| [amount, hmap.select { |hv| hv >= amount }.size] }.each do |step|
    curr = step.last
    next if curr >= prev

    prev = curr
    points << step
  end

  points
end

data = JSON.parse(File.read('dist/dump.json')).map { |src| Hashie::Mash.new(src) }
app_data = data.detect { |d| d.src =~ /\/assets\// }

hmap = heat_map(app_data)


FileUtils.rm Dir.glob('dist/crit_*.css')
store("crit_full.css", app_data.content)
breakpoints(hmap).map(&:first).each do |rate|
  rr = new_ranges(hmap, rate)
  crit = extract(app_data.content, rr)
  store("crit_%02d.css" % rate, crit) unless crit.empty?
end

# bmap = hmap.map { |v| v >= 7 ? 1 : 0 }
# rr = new_ranges(hmap, 7)
# crit = extract(app_data.content, rr)
# store('crit.css', crit)

binding.pry
